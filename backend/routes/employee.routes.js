const express = require('express');
const User = require('../models/user.model');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all employees (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get single employee
router.get('/:id', protect, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Only admin can view other employees
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update employee (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { hourlyRate, ...otherUpdates } = req.body;
    
    // Validate hourly rate
    if (hourlyRate !== undefined && (isNaN(hourlyRate) || hourlyRate < 0)) {
      return res.status(400).json({ message: 'Invalid hourly rate' });
    }

    const employee = await User.findByIdAndUpdate(
      req.params.id,
      { 
        ...otherUpdates,
        hourlyRate: hourlyRate
      },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete employee (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const employee = await User.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 