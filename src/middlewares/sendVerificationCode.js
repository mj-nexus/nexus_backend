const nodemailer = require('nodemailer');
const crypto = require('crypto');
const redisClient = require('../config/redis');  // Redis 클라이언트 가져오기

const generateVerificationCode = () => {
  return crypto.randomBytes(3).toString('hex');
};

const sendVerificationCode = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  const verificationCode = generateVerificationCode();

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);
    
    // 인증번호를 Redis에 저장하고, 만료 시간을 5분(300초)으로 설정합니다.
    await redisClient.set(email, verificationCode, 'EX', 300);

    res.send('Verification code sent');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending email');
  }
};

module.exports = sendVerificationCode;