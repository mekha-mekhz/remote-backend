const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const notificationcontroller=require("../controllers/notificationController")

// User routes
router.get("/", auth.authuser, notificationcontroller.getNotifications);
router.put("/:id/read", auth.authuser, notificationcontroller.markNotificationRead);
router.put("/read/all", auth.authuser, notificationcontroller.markAllRead);
router.delete("/:id", auth.authuser, notificationcontroller.deleteNotification);

// Admin route
router.get(
  "/admin/all",
  auth.authuser,
  auth.authorizeRoles("admin"),
  notificationcontroller.adminGetAllNotifications
);
router.post(
  "/create",
  auth.authuser,
  auth.authorizeRoles("admin", "manager"),notificationcontroller.createnoti)
module.exports= router;
