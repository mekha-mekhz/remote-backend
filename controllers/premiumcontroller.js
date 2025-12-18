const Attendance = require("../models/attendancemodel");
const Leave = require("../models/leavemodel");
const TimeEntry = require("../models/timemodel");

exports.getPremiumReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query; // optional, YYYY-MM-DD

    // --- Attendance ---
    const attendance = await Attendance.find({ user: userId }).sort({ date: -1 });

    // --- Leave ---
    const leaves = await Leave.find({ user: userId }).sort({ startDate: -1 });

    // --- Productivity ---
    let productivity = [];
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23,59,59,999);

      const entries = await TimeEntry.find({
        user: userId,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }).populate("task", "title");

      let totalMinutes = 0;
      let totalIdle = 0;
      const taskDetails = {};

      entries.forEach(entry => {
        const duration = entry.durationMinutes || 0;
        totalMinutes += duration;
        if(entry.status === "idle") totalIdle += duration;

        const taskTitle = entry.task ? entry.task.title : "Unassigned";
        if(!taskDetails[taskTitle]) taskDetails[taskTitle] = 0;
        taskDetails[taskTitle] += duration;
      });

      productivity.push({
        date,
        totalMinutes,
        totalIdle,
        tasksWorkedOn: taskDetails,
        entries
      });
    }

    res.status(200).json({ attendance, leaves, productivity });

  } catch (err) {
    console.error("Error fetching premium report:", err);
    res.status(500).json({ message: err.message });
  }
};
