const express = require("express");
const { registerUser, loginUser, getAllUsers } = require("../controllers/userController");
const authMiddleare  = require("../middlewares/authMiddleware");
const validateRegister = require("../middlewares/validateRequest");
const sendVerificationCode = require("../middlewares/sendVerificationCode");
const verifyCode = require("../middlewares/verifycodeMiddleware");

const router = express.Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", loginUser);
router.post("/sendVerificationCode", sendVerificationCode);
router.post("/verifyCode", verifyCode);
router.get("/getAll", authMiddleare, getAllUsers);

module.exports = router;
