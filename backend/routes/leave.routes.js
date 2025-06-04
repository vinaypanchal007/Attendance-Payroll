const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/user.model');

const router = express.Router();

// Get user's leave balance
router.get('/my-balance', protect, async (req, res) => {
  try {
    // For now, return a default balance of 20 days
    // In a real application, this would be calculated based on leave records
    res.json({ balance: 20 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 