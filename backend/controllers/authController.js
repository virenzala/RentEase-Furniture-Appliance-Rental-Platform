const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const emailService = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user', // 'user' | 'vendor' | 'admin'
      phone: phone || '',
      address: address || '',
      avatar: '',
      bio: '',
      gender: '',
      dob: ''
    });

    // Send Welcome Email asynchronously
    emailService.sendWelcomeEmail(newUser.email, newUser.name);

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address,
      avatar: newUser.avatar,
      bio: newUser.bio,
      gender: newUser.gender,
      dob: newUser.dob,
      token: generateToken(newUser._id)
    });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      avatar: user.avatar || '',
      bio: user.bio || '',
      gender: user.gender || '',
      dob: user.dob || '',
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
        gender: user.gender || '',
        dob: user.dob || '',
        createdAt: user.createdAt
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile failed:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const name = req.body.name || user.name;
      const phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      const address = req.body.address !== undefined ? req.body.address : user.address;
      const avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;
      const bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      const gender = req.body.gender !== undefined ? req.body.gender : user.gender;
      const dob = req.body.dob !== undefined ? req.body.dob : user.dob;
      
      const updatedUser = await User.findByIdAndUpdate(req.user._id, {
        name,
        phone,
        address,
        avatar,
        bio,
        gender,
        dob
      });

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        avatar: updatedUser.avatar || '',
        bio: updatedUser.bio || '',
        gender: updatedUser.gender || '',
        dob: updatedUser.dob || '',
        createdAt: updatedUser.createdAt
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile failed:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Reset password (demo mode)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Please provide email and new password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword
    });

    res.json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Password reset failed:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword
};
