const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {  
    type: String, 
    required: true, 
    unique: true,  
    lowercase: true 
  },

  password: {
    type: String,  
    required: true  
  },

  role: {
    type: String,
    enum: ['user', 'manager', 'admin'],
    default: 'user'
  },

  // ⭐ PREMIUM STATUS
  premium: {
    type: Boolean,
    default: false
  },

  // ⭐ PREMIUM EXPIRY (OPTIONAL BUT HIGHLY USEFUL)
  premiumExpiresAt: {
    type: Date,
    default: null
  },

  profilePhoto: { 
    type: String,
    default: ""
  },

  position: { 
    type: String,
    default: "Remote Employee"
  },

  isActive: { 
    type: Boolean, 
    default: true
  },

  timeEntries: [
    {   
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeEntry"
    }
  ],

  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  isVerified: {
  type: Boolean,
  default: false
},
isApproved: {
  type: Boolean,
  default: false
},
resetOTP: {
  type: String,
},
resetOTPExpiry: {
  type: Date,
},
status: {
    type: String,
    enum: ["available", "busy", "invisible", "dnd"],
    default: "available",
  },

});

module.exports = mongoose.model('User', userSchema);
