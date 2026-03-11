const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin
} = require('../middleware/validation');
const {
  generateToken,
  sendSuccessResponse,
  sendErrorResponse
} = require('../utils/helpers');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return sendErrorResponse(res, 400, 'User with this email or username already exists');
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      profile: {
        firstName: firstName || '',
        lastName: lastName || ''
      }
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    sendSuccessResponse(res, 201, 'User registered successfully', {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        virtualBalance: user.virtualBalance,
        profile: user.profile
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    sendErrorResponse(res, 500, 'Server error during registration', error);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendErrorResponse(res, 401, 'Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      return sendErrorResponse(res, 401, 'Account is deactivated');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return sendErrorResponse(res, 401, 'Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    sendSuccessResponse(res, 200, 'Login successful', {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        virtualBalance: user.virtualBalance,
        profile: user.profile,
        lastLogin: user.lastLogin
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    sendErrorResponse(res, 500, 'Server error during login', error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    sendSuccessResponse(res, 200, 'User retrieved successfully', {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        virtualBalance: user.virtualBalance,
        profile: user.profile,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    sendErrorResponse(res, 500, 'Server error while fetching user', error);
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    // Update profile fields
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (avatar !== undefined) user.profile.avatar = avatar;

    await user.save();

    sendSuccessResponse(res, 200, 'Profile updated successfully', {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        virtualBalance: user.virtualBalance,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    sendErrorResponse(res, 500, 'Server error while updating profile', error);
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendErrorResponse(res, 400, 'Current password and new password are required');
    }

    if (newPassword.length < 6) {
      return sendErrorResponse(res, 400, 'New password must be at least 6 characters long');
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return sendErrorResponse(res, 401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    sendSuccessResponse(res, 200, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    sendErrorResponse(res, 500, 'Server error while changing password', error);
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, (req, res) => {
  sendSuccessResponse(res, 200, 'Logout successful');
});

module.exports = router;
