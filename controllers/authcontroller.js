require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");
const nodemailer = require("nodemailer")
const crypto = require("crypto");





// ====================== CREATE USER / REGISTER ======================

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, position } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle image upload
    let profilePhoto = "";
    if (req.file?.path) {
      profilePhoto = req.file.path;
    }

    // ⭐ Create new user first
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      profilePhoto,
      position,

      premium: false,
      premiumExpiresAt: null,

      isVerified: false, // default
    });

    // ⭐ If admin → auto verify
    if (role === "admin") {
      newUser.isVerified = true;
    }

    // Save user
    await newUser.save();

    res.status(201).json({
      message:
        role === "admin"
          ? "Admin registered successfully"
          : "Registration successful. Wait for Admin Approval.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        position: newUser.position,
        profilePhoto: newUser.profilePhoto,
        premium: newUser.premium,
        premiumExpiresAt: newUser.premiumExpiresAt,
        isVerified: newUser.isVerified,
      },
    });
  } catch (err) {
    console.error("Error in createUser:", err);
    res.status(500).json({ message: err.message });
  }
};
// ====================== LOGIN USER ======================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Resolve secret key safely
    const SECRET = process.env.SECRET_KEY || process.env.secretkey;
    if (!SECRET) {
      console.error("❌ SECRET KEY MISSING");
      return res.status(500).json({
        message: "Server error: Secret key not configured",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        premium: user.premium,
      },
      SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        profilePhoto: user.profilePhoto,
        premium: user.premium,
        premiumExpiresAt: user.premiumExpiresAt,
      },
      token,
    });

  } catch (err) {
    console.error("Error in loginUser:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== GET LOGGED-IN USER ======================
exports.getLoggedUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Error in getLoggedUser:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== ADMIN DASHBOARD ======================
exports.adminDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email role premium"
    );

    res.status(200).json({
      message: "Welcome to the admin dashboard",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====================== LOGOUT ======================
exports.logoutUser = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

// ====================== GET ALL USERS ======================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====================== UPDATE USER ======================
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, position } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, position },
      { new: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error in updateUser:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== DELETE USER ======================
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error in deleteUser:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== UPGRADE TO PREMIUM ======================
exports.upgradeToPremium = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.premium = true;

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);

    user.premiumExpiresAt = expiry;
    await user.save();

    res.status(200).json({
      message: "User upgraded to Premium successfully",
      user,
    });
  } catch (err) {
    console.error("Upgrade error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== VERIFY USER (ADMIN) ======================
exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "User verified successfully",
      user,
    });
  } catch (err) {
    console.error("Error verifying user:", err);
    res.status(500).json({ message: err.message });
  }
};
exports.getPendingUsers = async (req, res) => {
  try {
    const pending = await User.find({ isApproved: false });
    res.status(200).json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isApproved: true },
      { new: true }
    );

    res.status(200).json({ message: "User approved", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.rejectUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json({ message: "User request rejected and deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get all normal users (role = user)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.managers= async (req, res) => {
  try {
    const managers = await User.find({ role: "manager" }).select("name email").lean();
    res.status(200).json({ success: true, managers });
  } catch (err) {
    console.error("Manager fetch error:", err);
    res.status(500).json({ message: "Failed to fetch managers" });
  }
};

exports.forgotpassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: "RemoteWork Tracker",
      to: user.email,
      subject: "Password Reset OTP",
      html: `
        <p>Hello ${user.name},</p>
        <h2>Your OTP: <b>${otp}</b></h2>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  
  }
 
}


exports.resetpassword = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashed = await bcrypt.hash(password, 10);

    user.password = hashed;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
// UPDATE STATUS
 exports.updatestatus=async (req, res) => {
  const { status } = req.body;

  if (!["available","busy","invisible","dnd"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { status },
      { new: true }
    );

    res.json({ status: user.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET STATUS (optional)
 exports.getstatus=async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ status: user.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// GET ALL USERS (for Admin / Manager)
exports.allstatus= async (req, res) => {
  try {
    const requester = await User.findById(req.user.id);

    if (!["admin", "manager"].includes(requester.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Return id, name, email, status, role
    const users = await User.find({}, "name email status role");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

