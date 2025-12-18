const User = require("../models/usermodel");
const Leave = require("../models/leavemodel");
const Task = require("../models/taskmodel");
const Dispute = require("../models/disputemodel");

/* ===================== USERS ===================== */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== LEAVES ===================== */
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("user", "name email role");
    res.status(200).json({ leaves });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.status(200).json({
      message: "Leave updated successfully",
      leave: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== TASKS ===================== */
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate(
      "assignedTo",
      "name email"
    );
    res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===================== ADMIN STATS ===================== */
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingApprovals = await User.countDocuments({ approved: false });

    const activeTasks = await Task.countDocuments({
      status: { $in: ["todo", "in_progress"] }
    });

    const disputes = await Dispute.countDocuments();

    res.status(200).json({
      totalUsers,
      pendingApprovals,
      activeTasks,
      disputes
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: err.message });
  }
};
