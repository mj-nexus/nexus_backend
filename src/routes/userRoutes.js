const express = require("express");
const { registerUser, loginUser, getAllUsers, getUserById, updateUser, searchUsers, uploadProfileImage, logoutUser, getUsersOnlineStatus, refreshAccessToken } = require("../controllers/userController");
const validateRegister = require("../middlewares/validateRequest");
const sendVerificationCode = require("../middlewares/sendVerificationCode");
const verifyCode = require("../middlewares/verifycodeMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadProfileMiddleware } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", loginUser);
router.get("/logout", authMiddleware, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/sendVerificationCode", sendVerificationCode);
router.post("/verifyCode", verifyCode);
router.get("/getUserById/:user_id", getUserById)
router.get("/getAll", getAllUsers);
router.get("/search", searchUsers);
router.get("/online-status", getUsersOnlineStatus);
router.patch("/updateUser/:user_id", authMiddleware, updateUser);
router.post("/upload-profile-image/:user_id", authMiddleware, uploadProfileMiddleware, uploadProfileImage);

module.exports = router;