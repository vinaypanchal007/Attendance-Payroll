const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Public registration
router.post('/register', async (req, res) => {
  try {
    // Extract only the necessary fields for public registration
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user with default values for required fields
    const user = await User.create({
      name,
      email,
      password,
      role: 'employee', // Default role
      position: 'New Employee',
      department: 'Unassigned',
      joinDate: new Date(),
      hourlyRate: 0 // Default hourly rate
    });

    // Create token with role information
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role 
      }, 
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hourlyRate: user.hourlyRate
    };

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: userResponse
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Admin registration (create employee with full details)
router.post('/admin/register', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify role
    if (!['admin', 'employee'].includes(user.role)) {
      return res.status(401).json({ message: 'Invalid user role' });
    }

    // Create token with role information
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role 
      }, 
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hourlyRate: user.hourlyRate
    };

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { password, email, role, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 