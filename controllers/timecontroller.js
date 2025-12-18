const TimeEntry = require("../models/timemodel");
const Task = require("../models/taskmodel");
const { createNotification } = require("./notificationController");

// ====================== START TIMER ======================
exports.startTimer = async (req, res) => {
  try {
    const { taskId, notes } = req.body;

    // Check if task exists (if provided)
    if (taskId) {
      const task = await Task.findById(taskId);
      if (!task) return res.status(404).json({ message: "Task not found" });
    }

    // Prevent multiple active timers for same user
    const activeEntry = await TimeEntry.findOne({ user: req.user.id, status: "active" });
    if (activeEntry) {
      return res.status(400).json({ message: "You already have an active timer" });
    }

    const newEntry = new TimeEntry({
      user: req.user.id,
      task: taskId || null,
      start: new Date(),
      notes,
      lastPing: new Date(),
      status: "active",
    });

    await newEntry.save();

    // Optional: notify task creator if user starts timer
    if (taskId) {
      const task = await Task.findById(taskId);
      if (task?.createdBy) {
        await createNotification({
          title: "Timer Started",
          message: `${req.user.name} started working on task: ${task.title}`,
          type: "task",
          userId: task.createdBy,
        });
      }
    }

    res.status(201).json({
      message: "Timer started successfully",
      timeEntry: newEntry,
    });
  } catch (err) {
    console.error("Error starting timer:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== STOP TIMER ======================
exports.stopTimer = async (req, res) => {
  try {
    const { entryId } = req.params;
    const entry = await TimeEntry.findById(entryId);

    if (!entry) return res.status(404).json({ message: "Time entry not found" });
    if (entry.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized to stop this timer" });
    if (entry.end) return res.status(400).json({ message: "Timer already stopped" });

    entry.end = new Date();
    entry.durationMinutes = Math.round((entry.end - entry.start) / (1000 * 60));
    entry.status = "stopped";
    await entry.save();

    // Optional: notify task creator
    if (entry.task) {
      const task = await Task.findById(entry.task);
      if (task?.createdBy) {
        await createNotification({
          title: "Timer Stopped",
          message: `${req.user.name} stopped working on task: ${task.title}`,
          type: "task",
          userId: task.createdBy,
        });
      }
    }

    res.status(200).json({
      message: "Timer stopped successfully",
      timeEntry: entry,
    });
  } catch (err) {
    console.error("Error stopping timer:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== PING TIMER (Keep Active) ======================
exports.pingTimer = async (req, res) => {
  try {
    const { entryId } = req.params;
    const entry = await TimeEntry.findById(entryId);

    if (!entry) return res.status(404).json({ message: "Time entry not found" });
    if (entry.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized to ping this timer" });
    if (entry.status === "stopped")
      return res.status(400).json({ message: "Cannot ping a stopped timer" });

    entry.lastPing = new Date();
    entry.status = "active";
    await entry.save();

    res.status(200).json({
      message: "Ping received — user marked active",
      timeEntry: entry,
    });
  } catch (err) {
    console.error("Error pinging timer:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== AUTO MARK IDLE ENTRIES ======================
exports.markIdleEntries = async () => {
  try {
    const now = new Date();
    const idleThreshold = 10 * 60 * 1000; // 10 mins

    const activeEntries = await TimeEntry.find({ status: "active" });
    for (const entry of activeEntries) {
      if (now - new Date(entry.lastPing) > idleThreshold) {
        entry.status = "idle";
        await entry.save();
        console.log(`Entry ${entry._id} marked as IDLE`);
      }
    }
  } catch (err) {
    console.error("Error auto-marking idle entries:", err);
  }
};

// ====================== GET LOGGED-IN USER ENTRIES ======================
exports.getMyEntries = async (req, res) => {
  try {
    const entries = await TimeEntry.find({ user: req.user.id })
      .populate("task", "title status")
      .sort({ createdAt: -1 });

    res.status(200).json({ entries });
  } catch (err) {
    console.error("Error fetching user entries:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== GET ALL ENTRIES (Admin / Manager) ======================
exports.getAllEntries = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const entries = await TimeEntry.find()
      .populate("user", "name email position")
      .populate("task", "title status")
      .sort({ createdAt: -1 });

    res.status(200).json({ entries });
  } catch (err) {
    console.error("Error fetching all entries:", err);
    res.status(500).json({ message: err.message });
  }
};
