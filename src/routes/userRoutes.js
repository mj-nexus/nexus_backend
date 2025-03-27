const express = require("express");
const { registerUser, loginUser, getAllUsers } = require("../controllers/userController");
const authMiddleare  = require("../middlewares/authMiddleware");
const validateRegister = require("../middlewares/validateRequest");

const router = express.Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", loginUser);
router.get("/getAll", authMiddleare, getAllUsers)

module.exports = router;
