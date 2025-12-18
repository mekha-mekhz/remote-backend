const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const attendanceController = require("../controllers/attendancecontroller");

// User routes
router.post("/checkin", auth.authuser, attendanceController.checkInUser);
router.post("/checkout", auth.authuser, attendanceController.checkOutUser);
router.get("/my", auth.authuser, attendanceController.getMyAttendance);

// Admin / Manager
router.get("/all", auth.authuser, attendanceController.getAllAttendance);

module.exports = router;
