
const Message = require('../models/Message');

exports.sendMessage = async (senderId, receiverId, content) => {
  const message = new Message({
    sender_id: senderId,
    receiver_id: receiverId,
    content,
  });
  await message.save();
  return message;
};
