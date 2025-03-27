const express = require('express');
const router = Router();
const authController = require('../controllers/authController');

//user register
router.post('/register', authController.register);

//user login
router.post('login', authController.login);

module.exports = router;