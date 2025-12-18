const TimeEntry = require("../models/timemodel");
const User = require("../models/usermodel");
const Task = require("../models/taskmodel");

// ====================== DAILY PRODUCTIVITY REPORT ======================
exports.getDailyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query; // expected format: YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ message: "Please provide a date (YYYY-MM-DD)" });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch all entries for this user on the given date
    const entries = await TimeEntry.find({
      user: userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).populate("task", "title");

    if (entries.length === 0) {
      return res.status(200).json({ message: "No entries found for this day", entries: [] });
    }

    // Compute total productive time
    let totalMinutes = 0;
    let totalIdle = 0;
    const taskDetails = {};

    entries.forEach((entry) => {
      const duration = entry.durationMinutes || 0;
      totalMinutes += duration;
      if (entry.status === "idle") totalIdle += duration;

      const taskTitle = entry.task ? entry.task.title : "Unassigned";
      if (!taskDetails[taskTitle]) taskDetails[taskTitle] = 0;
      taskDetails[taskTitle] += duration;
    });

    res.status(200).json({
      date,
      totalMinutes,
      totalIdle,
      tasksWorkedOn: taskDetails,
      entries,
    });
  } catch (err) {
    console.error("Error fetching daily report:", err);
    res.status(500).json({ message: err.message });
  }
};