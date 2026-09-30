const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    mobile: { type: String, required: false, unique: true, sparse: true, },
    password: String,
    
    passwordHistory: {  
    type: [String],   // ✅ array of old hashed passwords
    default: []
    },

    pendingAlternate: {
      type: String,
      default: null
    },

    // Alternate emails/mobiles
    alternates: {
      type: [String],
      default: []
    },
 
// OTP fields
  otp: {
  type: String,
  default: null
  },
  otpExpiry: {
  type: Number,
  default: null
  },
  otpAttempts: {
  type: Number,
 default: 0
  },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
