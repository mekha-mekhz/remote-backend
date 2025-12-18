
const mongoose = require('mongoose');

const ProductivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  totalMinutes: { type: Number, default: 0 },
  totalIdle: { type: Number, default: 0 },
  tasksWorkedOn: { type: Map, of: Number }, // taskName => minutes
});

module.exports = mongoose.model('Productivity', ProductivitySchema);
