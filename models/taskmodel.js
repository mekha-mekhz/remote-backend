const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },

  description: { 
    type: String, 
    default: "" 
  },

  // Who is responsible for completing this task
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },

  status: { 
    type: String, 
    enum: ['todo','in_progress','done'], 
    default: 'todo' 
  },

  priority: { 
    type: String, 
    enum: ['low','medium','high'], 
    default: 'medium' 
  },

  // Estimated time to complete task (minutes)
  estimatedMinutes: { 
    type: Number, 
    default: 0 
  },

  // Notes / progress updates
  notes: {
    type: String,
    default: ""
  },

  // Track when task was completed
  completedAt: {
    type: Date,
  },

  // Who created the task (Manager / Admin)
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true }); // <-- Automatically creates createdAt + updatedAt

module.exports = mongoose.model('Task', taskSchema);
