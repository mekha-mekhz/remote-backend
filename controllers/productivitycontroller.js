// controllers/productivityController.js

const Productivity=require("../models/productivitymodel")

// Get all productivity entries for current user
exports.getMyReports = async (req, res) => {
  try {
    const reports = await Productivity.find({ userId: req.user._id }).sort({ date: -1 });
    res.json({ reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a productivity entry
exports.addProductivity = async (req, res) => {
  const { date, totalMinutes, totalIdle, tasksWorkedOn } = req.body;
  try {
    const entry = await Productivity.create({
      userId: req.user._id,
      date,
      totalMinutes,
      totalIdle,
      tasksWorkedOn,
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add productivity' });
  }
};

// Update progress for an entry
exports.updateProgress = async (req, res) => {
  try {
    const entry = await Productivity.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update progress' });
  }
};

// Get weekly productivity (hours per day)
exports.getWeeklyReport = async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6); // last 7 days including today

    const entries = await Productivity.find({
      userId: req.user._id,
      date: { $gte: weekAgo, $lte: today }
    });

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weeklyData = days.map((d, i) => {
      const dayDate = new Date();
      dayDate.setDate(today.getDate() - (6 - i));
      const totalMinutes = entries
        .filter(e => e.date.toDateString() === dayDate.toDateString())
        .reduce((sum, e) => sum + e.totalMinutes, 0);
      return { day: d, hours: Math.round(totalMinutes / 60) };
    });

    res.json({ weeklyData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch weekly report' });
  }
};

// Get monthly productivity (hours per week)
exports.getMonthlyReport = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const entries = await Productivity.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: today }
    });

    // divide month into weeks
    const weeks = [1,2,3,4];
    const monthlyData = weeks.map(week => {
      const weekStart = new Date(today.getFullYear(), today.getMonth(), (week-1)*7 + 1);
      const weekEnd = new Date(today.getFullYear(), today.getMonth(), week*7);
      const totalMinutes = entries
        .filter(e => e.date >= weekStart && e.date <= weekEnd)
        .reduce((sum, e) => sum + e.totalMinutes, 0);
      return { week: `Week ${week}`, hours: Math.round(totalMinutes / 60) };
    });

    res.json({ monthlyData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch monthly report' });
  }
};
