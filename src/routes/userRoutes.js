const express = require("express");
const { registerUser, loginUser, getAllUsers, getUserById, updateUser } = require("../controllers/userController");
const authMiddleare  = require("../middlewares/authMiddleware");
const validateRegister = require("../middlewares/validateRequest");
const sendVerificationCode = require("../middlewares/sendVerificationCode");
const verifyCode = require("../middlewares/verifycodeMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", loginUser);
router.post("/sendVerificationCode", sendVerificationCode);
router.post("/verifyCode", verifyCode);
router.get("/getUserById/:user_id", getUserById)
router.get("/getAll", authMiddleare, getAllUsers);
router.patch("/updateUser/:user_id", authMiddleware, updateUser);

module.exports = router;