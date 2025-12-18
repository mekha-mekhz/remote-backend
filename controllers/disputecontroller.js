// controllers/disputeController.js
const Dispute = require("../models/disputemodel");
const User = require("../models/usermodel");

// Helper to attach user data manually
const attachUserData = async (dispute) => {
  if (!dispute) return dispute;

  if (dispute.reportedBy) {
    const reporter = await User.findById(dispute.reportedBy).select("name email role").lean();
    dispute.reportedBy = reporter || null;
  }

  if (dispute.assignedTo) {
    const assignee = await User.findById(dispute.assignedTo).select("name email role").lean();
    dispute.assignedTo = assignee || null;
  }

  return dispute;
};

// ====================== CREATE DISPUTE ======================
exports.createDispute = async (req, res) => {
  try {
    const { title, description, assignedTo, priority } = req.body;

    const newDispute = new Dispute({
      title,
      description,
      reportedBy: req.user.id,
      assignedTo: assignedTo || null,
      priority: priority || "medium",
    });

    await newDispute.save();

    res.status(201).json({ message: "Dispute reported successfully", dispute: newDispute });
  } catch (err) {
    console.error("Error in createDispute:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== GET ALL DISPUTES ======================
exports.getAllDisputes = async (req, res) => {
  try {
    let disputes;

    if (req.user.role === "admin") {
      disputes = await Dispute.find().sort({ createdAt: -1 }).lean();
    } else if (req.user.role === "manager") {
      disputes = await Dispute.find({ assignedTo: req.user.id }).sort({ createdAt: -1 }).lean();
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    // Attach user data manually
    const result = await Promise.all(disputes.map(d => attachUserData(d)));

    res.status(200).json({ disputes: result });
  } catch (err) {
    console.error("Error in getAllDisputes:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== GET SINGLE DISPUTE ======================
exports.getDisputeById = async (req, res) => {
  try {
    let dispute = await Dispute.findById(req.params.id).lean();
    if (!dispute) return res.status(404).json({ message: "Dispute not found" });

    dispute = await attachUserData(dispute);

    res.status(200).json({ dispute });
  } catch (err) {
    console.error("Error in getDisputeById:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== UPDATE DISPUTE ======================
exports.updateDispute = async (req, res) => {
  try {
    const { title, description, status, assignedTo, priority, resolutionNotes } = req.body;

    let dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: "Dispute not found" });

    if (req.user.role !== "admin" && dispute.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this dispute" });
    }

    dispute.title = title || dispute.title;
    dispute.description = description || dispute.description;
    dispute.status = status || dispute.status;
    dispute.priority = priority || dispute.priority;
    dispute.assignedTo = assignedTo || dispute.assignedTo;
    dispute.resolutionNotes = resolutionNotes || dispute.resolutionNotes;

    await dispute.save();

    dispute = await attachUserData(dispute);

    res.status(200).json({ message: "Dispute updated successfully", dispute });
  } catch (err) {
    console.error("Error in updateDispute:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== DELETE DISPUTE ======================
exports.deleteDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: "Dispute not found" });

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this dispute" });
    }

    await Dispute.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Dispute deleted successfully" });
  } catch (err) {
    console.error("Error in deleteDispute:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== DISPUTE STATS ======================
exports.getDisputeStats = async (req, res) => {
  try {
    const totalDisputes = await Dispute.countDocuments();
    const openDisputes = await Dispute.countDocuments({ status: "open" });
    const resolvedDisputes = await Dispute.countDocuments({ status: "resolved" });
    const inProgressDisputes = await Dispute.countDocuments({ status: "in_progress" });

    res.status(200).json({ totalDisputes, openDisputes, resolvedDisputes, inProgressDisputes });
  } catch (err) {
    console.error("Error in getDisputeStats:", err);
    res.status(500).json({ message: err.message });
  }
};
exports.getMyDisputes = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const disputes = await Dispute.find({
      reportedBy: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(disputes);
  } catch (error) {
    console.error("Get My Disputes Error:", error);
    res.status(500).json({
      message: "Failed to load disputes",
    });
  }
};
