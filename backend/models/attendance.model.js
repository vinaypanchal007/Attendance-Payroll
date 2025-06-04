const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    default: null
  },
  totalTimeInSeconds: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'on-leave'],
    default: 'present'
  },
  project: {
    type: String,
    required: true,
    default: 'General'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate total time when checking out
attendanceSchema.pre('save', function(next) {
  if (this.checkOut && this.checkIn) {
    this.totalTimeInSeconds = Math.floor((this.checkOut - this.checkIn) / 1000);
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance; 