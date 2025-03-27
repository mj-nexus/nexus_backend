const messageService = require('../services/messageService');

exports.sendMessage = async (req, res) => {
  const { receiver_id, content } = req.body;
  try {
    const newMessage = await messageService.sendMessage(req.user.id, receiver_id, content);
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: '메시지 전송 실패' });
  }
};
