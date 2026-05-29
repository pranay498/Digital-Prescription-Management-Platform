const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

class UserService {
  /**
   * Register a new user
   */
  async registerUser({ email, password, role, name, phoneNumber, signature }) {
    if (!email || !password || !role || !name || !phoneNumber) {
      throw new ApiError(400, 'All fields (email, password, role, name, phoneNumber) are required.');
    }

    if (!['doctor', 'patient'].includes(role)) {
      throw new ApiError(400, 'Role must be either "doctor" or "patient".');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists.');
    }

    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      throw new ApiError(400, 'User with this phone number already exists.');
    }

    let doctorSignature = '';
    if (role === 'doctor') {
      doctorSignature = signature || `Dr. ${name}, M.D.`;
    }

    const user = await User.create({
      email,
      password,
      role,
      name,
      phoneNumber,
      signature: doctorSignature
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        phoneNumber: user.phoneNumber,
        signature: user.signature
      }
    };
  }

  /**
   * Log in an existing user
   */
  async loginUser({ email, password }) {
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        phoneNumber: user.phoneNumber,
        signature: user.signature
      }
    };
  }

  /**
   * Get user details by ID
   */
  async getUserById(id) {
    const user = await User.findById(id).select('-password');
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }
    return user;
  }

  /**
   * Update profile fields (name, email, phoneNumber, signature)
   */
  async updateProfile(id, { name, email, phoneNumber, signature }) {
    const user = await User.findById(id);
    if (!user) throw new ApiError(404, 'User not found.');

    // Check email uniqueness (skip if unchanged)
    if (email && email !== user.email) {
      const taken = await User.findOne({ email });
      if (taken) throw new ApiError(400, 'Email is already in use by another account.');
      user.email = email;
    }

    // Check phone uniqueness (skip if unchanged)
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const taken = await User.findOne({ phoneNumber });
      if (taken) throw new ApiError(400, 'Phone number is already in use by another account.');
      user.phoneNumber = phoneNumber;
    }

    if (name) user.name = name.trim();
    if (signature !== undefined) user.signature = signature;

    await user.save();

    return {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      phoneNumber: user.phoneNumber,
      signature: user.signature
    };
  }

  /**
   * Change password — verifies current password first
   */
  async changePassword(id, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Both current and new password are required.');
    }
    if (newPassword.length < 6) {
      throw new ApiError(400, 'New password must be at least 6 characters.');
    }

    const user = await User.findById(id);
    if (!user) throw new ApiError(404, 'User not found.');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new ApiError(401, 'Current password is incorrect.');

    user.password = newPassword; // pre-save hook will hash it
    await user.save();
  }

  /**
   * Delete account permanently
   */
  async deleteAccount(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new ApiError(404, 'User not found.');
  }

  /**
   * Generate JWT for a user
   */
  generateToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
}

module.exports = new UserService();
