const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Profile } = require("../models/");
const path = require('path');
const { userRegister, profileRegister, existingUser, userLogin, getUserProfile, getUserProfilesById } = require("../services/authService");

// 회원가입 (INSERT)
exports.registerUser = async (req, res) => {
    try {
        const { name, student_id, email, password, company, phone, skill } = req.body;

        if (!name || !student_id || !email || !password) {
            return res.status(400).json({ error: "필수 입력값이 부족합니다." });
        }

        // student_id로 사용자 중복 검사
        const userExists = await User.findOne({ where: { student_id } });
        if (userExists) {
            return res.status(401).json({ error: "이미 등록된 학번입니다." });
        }

        // email로 프로필 중복 검사
        const emailExists = await Profile.findOne({ where: { email } });
        if (emailExists) {
            return res.status(401).json({ error: "이미 등록된 이메일입니다." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { student_id, password: hashedPassword };
        
        // 사용자 생성 후 생성된 user_id를 가져옴
        const createdUser = await userRegister(newUser);
        
        const newProfile = { 
            user_id: createdUser.user_id, 
            user_name: name, 
            email, 
            company, 
            phone, 
            skill 
        };

        await profileRegister(newProfile);

        return res.status(201).json({ message: "회원가입 성공", user: { newUser, newProfile } });
    } catch (error) {
        return res.status(500).json({ message: "회원가입 실패", error: error.message });
    }
};


// 로그인 (SELECT)
exports.loginUser = async (req, res) => {
    try {
        const { student_id, password } = req.body;

        // 비밀번호 검증을 위해 먼저 password 필드를 포함하여 사용자 조회
        const userWithPassword = await User.findOne({ where: { student_id } });
        if (!userWithPassword) {
            return res.status(401).json({ message: "학번 또는 비밀번호가 올바르지 않습니다." });
        }

        // 비밀번호 비교
        const isMatch = await bcrypt.compare(password, userWithPassword.password);
        if (!isMatch) {
            return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
        }

        // 비밀번호 검증 성공 후, 프로필 정보가 포함된 사용자 정보 조회
        const user = await userLogin({ where: { student_id } });

        // JWT 토큰 발급 (accessToken, refreshToken)
        const accessToken = jwt.sign({ student_id: userWithPassword.student_id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ student_id: userWithPassword.student_id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, { httpOnly: true });
        res.json({
            message: "로그인 성공",
            accessToken,
            user
        });
    } catch (error) {
        res.status(500).json({ message: "로그인 실패", error: error.message });
    }
};


// 사용자 목록 조회 (SELECT ALL)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await getUserProfile();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "사용자 조회 실패", error: error.message });
    }
};

// 특정 사용자 조회 (SELECT WHERE)
exports.getUserById = async (req, res) => {
    try {
        const { user_id } = req.params
        const user = await getUserProfilesById({user_id: Number(user_id)});

        if (!user) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }

        const userData = user.toJSON();
        delete userData.password;
        res.json(userData);

    } catch (error) {
        res.status(500).json({ message: "사용자 조회 실패", error: error.message });
    }
};
// 사용자 정보 수정 (UPDATE)
exports.updateUser = async (req, res) => {
    try {
        const { user_id } = req.params;  // user_id로 요청 받음
        
        console.log('📥 요청 도착 - user_id:', user_id);
        console.log('📦 요청 바디:', req.body);
        
        // Profile 객체가 있는 경우와 없는 경우 모두 처리
        const profileData = req.body.Profile || req.body;
        const { user_name, nick_name, email, company, phone, skill, bio, profile_image } = profileData;

        // user_id 기준으로 사용자 찾기
        const user = await User.findByPk(user_id);
        if (!user) {
            console.log('❌ 사용자 없음:', user_id);
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }

        // user_id 기준으로 프로필 찾기
        const profile = await Profile.findByPk(user_id);
        if (!profile) {
            console.log('❌ 프로필 없음:', user_id);
            return res.status(404).json({ message: "사용자 프로필을 찾을 수 없습니다." });
        }

        const originalData = profile.toJSON();
        console.log('📂 기존 프로필 정보:', originalData);

        const updateData = {};
        if (user_name !== undefined && user_name !== originalData.user_name) updateData.user_name = user_name;
        if (nick_name !== undefined && nick_name !== originalData.nick_name) updateData.nick_name = nick_name;
        if (email !== undefined && email !== originalData.email) updateData.email = email;
        if (company !== undefined && company !== originalData.company) updateData.company = company;
        if (phone !== undefined && phone !== originalData.phone) updateData.phone = phone;
        if (bio !== undefined && bio !== originalData.bio) updateData.bio = bio;
        if (profile_image !== undefined && profile_image !== originalData.profile_image) updateData.profile_image = profile_image;
        if (skill !== undefined && JSON.stringify(skill) !== JSON.stringify(originalData.skill)) updateData.skill = skill;

        console.log('🛠️ 변경된 필드:', updateData);

        if (Object.keys(updateData).length === 0) {
            console.log('⚠️ 변경 사항 없음 (모든 값이 기존과 동일)');
            return res.status(400).json({ message: "업데이트할 내용이 없습니다." });
        }

        const [affectedRows] = await Profile.update(updateData, { where: { user_id } });

        if (affectedRows === 0) {
            console.log('⚠️ 업데이트 실패 - 영향 받은 행 없음');
            return res.status(400).json({ message: "업데이트 실패 (행이 변경되지 않음)" });
        }

        console.log('✅ 사용자 정보 수정 완료:', user_id);
        res.json({ message: "사용자 정보 수정 완료" });

    } catch (error) {
        console.error('🔥 사용자 정보 수정 실패:', error.message);
        res.status(500).json({ message: "사용자 정보 수정 실패", error: error.message });
    }
};



// 사용자 삭제 (DELETE)
exports.deleteUser = async (req, res) => {
    try {
        const { student_id } = req.params;

        const user = await User.findByPk(student_id);
        if (!user) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }

        await User.destroy({ where: { student_id } });

        res.json({ message: "사용자 삭제 완료" });
    } catch (error) {
        res.status(500).json({ message: "사용자 삭제 실패", error: error.message });
    }
};

/**
 * 유저 통합 검색 컨트롤러 (searchType 없이 keyword만)
 * @route GET /api/user/search
 * @query {string} keyword - 검색 키워드
 * @query {number} page - 페이지 번호
 * @query {number} limit - 페이지당 항목 수
 */
exports.searchUsers = async (req, res) => {
    try {
        const { keyword } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!keyword || keyword.trim() === '') {
            return res.status(400).json({ error: '검색어를 입력해주세요.' });
        }
        if (page < 1) {
            return res.status(400).json({ error: '페이지 번호는 1 이상이어야 합니다.' });
        }
        if (limit < 1 || limit > 100) {
            return res.status(400).json({ error: '한 페이지당 항목 수는 1에서 100 사이여야 합니다.' });
        }
        const searchParams = { keyword, page, limit };
        const result = await require('../services/authService').searchUsers(searchParams);
        res.json(result);
    } catch (err) {
        console.error('유저 검색 오류:', err);
        res.status(500).json({ error: '유저 검색 중 오류가 발생했습니다.' });
    }
};

/**
 * 프로필 이미지 업로드
 * @route POST /api/user/upload-profile-image/:user_id
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 * @returns {object} 업로드 결과
 */
exports.uploadProfileImage = async (req, res) => {
    try {
        const { user_id } = req.params;
        
        // 파일이 업로드되었는지 확인
        if (!req.file) {
            return res.status(400).json({ error: '이미지 파일이 제공되지 않았습니다.' });
        }

        // 사용자 프로필 확인
        const profile = await Profile.findByPk(user_id);
        if (!profile) {
            return res.status(404).json({ error: '사용자 프로필을 찾을 수 없습니다.' });
        }

        // 이전 프로필 이미지 경로
        const previousImage = profile.profile_image;

        // 새 이미지 경로 생성 (클라이언트에서 접근 가능한 URL 경로)
        const newImagePath = `profile/${req.file.filename}`;

        // 프로필 이미지 경로 업데이트
        await Profile.update(
            { profile_image: newImagePath },
            { where: { user_id } }
        );

        // 이전 이미지 삭제 로직 (실제 파일 삭제는 보안 이슈가 있을 수 있어 주석 처리)
        // if (previousImage && previousImage !== newImagePath) {
        //     const oldImagePath = path.join(__dirname, '..', previousImage.replace('/upload', 'uploads'));
        //     if (fs.existsSync(oldImagePath)) {
        //         fs.unlinkSync(oldImagePath);
        //     }
        // }

        return res.status(200).json({
            success: true,
            message: '프로필 이미지가 성공적으로 업로드되었습니다.',
            profileImage: newImagePath
        });
    } catch (error) {
        console.error('🔥 프로필 이미지 업로드 실패:', error.message);
        return res.status(500).json({
            success: false,
            error: '프로필 이미지 업로드 중 오류가 발생했습니다.',
            message: error.message
        });
    }
};

module.exports = exports;