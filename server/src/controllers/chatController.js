const chatService = require('../services/chatService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const handleChat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;
  const user = req.user;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new ApiError(400, 'Message query is required.');
  }

  const responseText = await chatService.getChatResponse(user, message.trim(), history || []);

  res.status(200).json(new ApiResponse(200, { response: responseText }, 'Chat response generated successfully.'));
});

module.exports = {
  handleChat
};
