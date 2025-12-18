const Leave = require("../models/leavemodel");

// ================= APPLY LEAVE =================
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const newLeave = new Leave({
      user: req.user.id,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    await newLeave.save();
    res.status(201).json({ message: "Leave applied successfully", leave: newLeave });
  } catch (err) {
    console.error("Error in applyLeave:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET MY LEAVES =================
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ leaves });
  } catch (err) {
    console.error("Error in getMyLeaves:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET ALL LEAVES (Admin/Manager) =================
exports.getAllLeaves = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const leaves = await Leave.find()
      .populate("user", "name email position")
      .sort({ createdAt: -1 });

    res.status(200).json({ leaves });
  } catch (err) {
    console.error("Error in getAllLeaves:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= APPROVE / REJECT LEAVE =================
exports.updateLeaveStatus = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = status;
    leave.approvedBy = req.user.id;
    await leave.save();

    res.status(200).json({ message: `Leave ${status}`, leave });
  } catch (err) {
    console.error("Error in updateLeaveStatus:", err);
    res.status(500).json({ message: err.message });
  }
};
