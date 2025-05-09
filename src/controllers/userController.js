const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const UserProfile = require("../models/profileModel")

// 회원가입 (INSERT)
exports.registerUser = async (req, res) => {
    try {
        const { name, student_id, email, password, company, phone, skill } = req.body;

        // 중복된 이메일 확인
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "이미 가입된 이메일입니다." });
        }

        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 사용자 생성
        const newUser = await User.create({
            name,
            student_id,
            email,
            password: hashedPassword,
            company,
            phone,
            skill
        });

        res.status(201).json({ message: "회원가입 성공", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "회원가입 실패", error: error.message });
    }
};

// 로그인 (SELECT)
exports.loginUser = async (req, res) => {
    try {
        const { student_id, password } = req.body;

        // 사용자 찾기
        const user = await User.findOne({ where: { student_id } });
        if (!user) {
            return res.status(401).json({ message: "학번 또는 비밀번호가 올바르지 않습니다." });
        }

        // 비밀번호 비교
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
        }

        // JWT 토큰 발급 (accessToken, refreshToken)
        const accessToken = jwt.sign({ student_id: user.student_id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ student_id: user.student_id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

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
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "사용자 조회 실패", error: error.message });
    }
};

// 특정 사용자 조회 (SELECT WHERE)
exports.getUserById = async (req, res) => {
    try {
        const { user_id } = req.params
        const user = await User.findOne({
            where: { user_id },
            include: [{
                model: UserProfile,
                required: false  // left outer join
            }]
        });

        if (!user) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "사용자 조회 실패", error: error.message });
    }
};
// 사용자 정보 수정 (UPDATE)
exports.updateUser = async (req, res) => {
    try {
        const { user_id } = req.params;  // user_id로 요청 받음
        const { name, email, company, phone, skill } = req.body;

        console.log('📥 요청 도착 - user_id:', user_id);
        console.log('📦 요청 바디:', req.body);

        // user_id 기준으로 사용자 찾기
        const user = await User.findByPk(user_id);
        console.log(user);
        if (!user) {
            console.log('❌ 사용자 없음:', user_id);
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }

        const originalData = user.toJSON();
        console.log('📂 기존 사용자 정보:', originalData);

        const updateData = {};
        if (name !== undefined && name !== originalData.name) updateData.name = name;
        if (email !== undefined && email !== originalData.email) updateData.email = email;
        if (company !== undefined && company !== originalData.company) updateData.company = company;
        if (phone !== undefined && phone !== originalData.phone) updateData.phone = phone;
        if (skill !== undefined && JSON.stringify(skill) !== JSON.stringify(originalData.skill)) updateData.skill = skill;

        console.log('🛠️ 변경된 필드:', updateData);

        if (Object.keys(updateData).length === 0) {
            console.log('⚠️ 변경 사항 없음 (모든 값이 기존과 동일)');
            return res.status(400).json({ message: "업데이트할 내용이 없습니다." });
        }

        const [affectedRows] = await User.update(updateData, { where: { user_id } });

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

module.exports = exports;