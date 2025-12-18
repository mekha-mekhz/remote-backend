
const Notification = require("../models/notificationmodel");



/* ================================
   GET NOTIFICATIONS FOR LOGGED USER
================================ */
exports.getNotifications = async (req, res) => {
  try {
    const { id: userId, role: userRole } = req.user;

    const notifications = await Notification.find({
      $or: [{ userId }, { role: userRole }, { role: "all" }],
    }).sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

/* ================================
      MARK SINGLE AS READ
================================ */
exports. markNotificationRead = async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({
      message: "Notification marked as read",
      notification: updated,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification" });
  }
};

/* ================================
        MARK ALL AS READ
================================ */
exports.markAllRead = async (req, res) => {
  try {
    const { id: userId, role: userRole } = req.user;

    await Notification.updateMany(
      {
        $or: [{ userId }, { role: userRole }, { role: "all" }],
      },
      { read: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notifications" });
  }
};

/* ================================
        DELETE NOTIFICATION
================================ */
exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

/* ================================
      ADMIN – GET ALL NOTICES
================================ */
exports.adminGetAllNotifications = async (req, res) => {
  try {
    const data = await Notification.find().sort({ createdAt: -1 });
    res.json({ notifications: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all notifications" });
  }
};

/* ================================
         HELPER: CREATE
================================ */
exports.createNotification = async ({
  title,
  message,
  type = "info",
  userId = null,
  role = "user",
}) => {
  try {
    await Notification.create({
      title,
      message,
      type,
      userId,
      role,
    });
  } catch (err) {
    console.log("Notification creation failed:", err.message);
  }
};
// Create notification (used by manager to notify assigned users)
exports.createnoti=async (req, res) => {
    const { title, message, type, userId, role } = req.body;
    try {
      await Notification.create({ title, message, type, userId, role });
      res.status(201).json({ message: "Notification sent" });
    } catch (err) {
      res.status(500).json({ error: "Failed to create notification" });
    }
  }

