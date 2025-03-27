const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

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
        const { student_id } = req.params;
        const user = await User.findByPk(student_id);

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
        const { student_id } = req.params;
        const { username, email } = req.body;

        const user = await User.findByPk(student_id);
        if (!user) {
            return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }

        // 정보 업데이트
        await User.update({ username, email }, { where: { student_id } });

        res.json({ message: "사용자 정보 수정 완료" });
    } catch (error) {
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