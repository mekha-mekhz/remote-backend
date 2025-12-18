const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, default: null }
});

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // store as YYYY-MM-DD
    required: true
  },
  sessions: [sessionSchema],
  totalHours: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
