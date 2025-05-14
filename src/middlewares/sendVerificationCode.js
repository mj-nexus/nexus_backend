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
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto;">
      <h2 style="color: #2c3e50;">🔐 이메일 인증 코드</h2>
      <p>안녕하세요,</p>
      <p>아래의 인증 코드를 입력해 주세요:</p>
      <div style="font-size: 24px; font-weight: bold; background: #f1f1f1; padding: 10px; border-radius: 5px; text-align: center; margin: 20px 0;">
        ${verificationCode}
      </div>
      <p style="font-size: 12px; color: #999;">이 코드는 5분간만 유효합니다.</p>
    </div>
  `,
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