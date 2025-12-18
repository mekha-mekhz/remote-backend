const Reminder = require("../models/reminderModel");

/**
 * CREATE REMINDER
 */
exports.createReminder = async (req, res) => {
  try {
    const { title, message, remindAt, type } = req.body;

    if (!title || !message || !remindAt) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (new Date(remindAt) <= new Date()) {
      return res.status(400).json({ message: "Reminder must be a future date" });
    }

    const reminder = await Reminder.create({
      user: req.user.id,
      title,
      message,
      remindAt,
      type
    });

    res.status(201).json({
      message: "Reminder created successfully",
      reminder
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET ALL USER REMINDERS
 * 📋 Shows upcoming & expired
 */
exports.getMyReminders = async (req, res) => {
  try {
    const now = new Date();

    const reminders = await Reminder.find({ user: req.user.id })
      .sort({ remindAt: 1 });

    const formatted = reminders.map((r) => ({
      _id: r._id,
      title: r.title,
      message: r.message,
      remindAt: r.remindAt,
      type: r.type,
      status: r.remindAt > now ? "upcoming" : "expired" // 🟢 🔴
    }));

    res.json({ reminders: formatted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE REMINDER ❌
 */
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    await reminder.deleteOne();

    res.json({ message: "Reminder deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
