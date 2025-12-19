const Attendance=require("../models/attendancemodel");

// ----------------- CHECK-IN -----------------
exports.checkInUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    let attendance = await Attendance.findOne({ user: userId, date: today });
    if (!attendance) {
      attendance = new Attendance({ user: userId, date: today, sessions: [] });
    } else {
      const lastSession = attendance.sessions[attendance.sessions.length - 1];
      if (lastSession && !lastSession.checkOut) {
        return res.status(400).json({ message: "Already checked in!" });
      }
    }

    attendance.sessions.push({ checkIn: new Date() });
    await attendance.save();
    res.status(201).json({ message: "Checked in successfully", attendance });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// ----------------- CHECK-OUT -----------------
exports.checkOutUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({ user: userId, date: today });
    if (!attendance) return res.status(400).json({ message: "No check-in today" });

    const lastSession = attendance.sessions[attendance.sessions.length - 1];
    if (!lastSession || lastSession.checkOut) {
      return res.status(400).json({ message: "You are not checked in!" });
    }

    lastSession.checkOut = new Date();

    const sessionHours = (lastSession.checkOut - lastSession.checkIn) / (1000 * 60 * 60);
    attendance.totalHours += Number(sessionHours.toFixed(2));

    await attendance.save();
    res.status(200).json({ message: "Checked out successfully", attendance });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// ----------------- GET MY ATTENDANCE -----------------
exports.getMyAttendance = async (req, res) => {
  try {
    const entries = await Attendance.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json({ entries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------- ADMIN -----------------
exports.getAllAttendance = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const entries = await Attendance.find()
      .populate("user", "name email position")
      .sort({ date: -1 });

    res.status(200).json({ entries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

