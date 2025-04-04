const redisClient = require("../config/redis");

redisClient
const verifyCode = async (req, res, next) => {
    const { email, code } = req.body;
  
    if (!email || !code) {
      return res.status(400).send('Email and verification code are required');
    }
  
    try {
      // Redis에서 저장된 인증 코드를 가져옵니다.
      const storedCode = await redisClient.get(email);
  
      if (!storedCode) {
        return res.status(400).send('Verification code has expired or is invalid');
      }
  
      if (storedCode === code) {
        res.send('Verification successful');
        res.status(200)
      } else {
        res.status(400).send('Invalid verification code');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error verifying code');
    }
  };
  
  module.exports = verifyCode;