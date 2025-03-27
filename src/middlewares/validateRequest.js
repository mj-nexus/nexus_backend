const { body, validationResult } = require("express-validator");

const validateRegister = [
    body("email").isEmail().withMessage("올바른 이메일을 입력하세요."),
    body("password").isLength({ min: 6 }).withMessage("비밀번호는 최소 6자 이상이어야 합니다."),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

module.exports = validateRegister;
