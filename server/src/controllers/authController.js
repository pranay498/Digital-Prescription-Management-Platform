const userService = require('../services/userService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Helper to set token cookie
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };
  res.cookie('token', token, cookieOptions);
};

const register = asyncHandler(async (req, res) => {
  const { email, password, role, name, phoneNumber, signature } = req.body;
  const result = await userService.registerUser({ email, password, role, name, phoneNumber, signature });
  
  // Set JWT as cookie
  setTokenCookie(res, result.token);

  res.status(201).json(new ApiResponse(201, { user: result.user, token: result.token }, 'User registered successfully.'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await userService.loginUser({ email, password });
  
  // Set JWT as cookie
  setTokenCookie(res, result.token);

  res.status(200).json(new ApiResponse(200, { user: result.user, token: result.token }, 'User logged in successfully.'));
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.status(200).json(new ApiResponse(200, null, 'User logged out successfully.'));
});

const me = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  res.status(200).json(new ApiResponse(200, { user }, 'User profile retrieved successfully.'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber, signature } = req.body;
  const user = await userService.updateProfile(req.user.id, { name, email, phoneNumber, signature });
  res.status(200).json(new ApiResponse(200, { user }, 'Profile updated successfully.'));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user.id, { currentPassword, newPassword });
  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully.'));
});

const deleteAccount = asyncHandler(async (req, res) => {
  await userService.deleteAccount(req.user.id);
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  res.status(200).json(new ApiResponse(200, null, 'Account deleted successfully.'));
});

module.exports = {
  register,
  login,
  logout,
  me,
  updateProfile,
  changePassword,
  deleteAccount
};
