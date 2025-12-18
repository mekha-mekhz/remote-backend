const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const leaveController = require("../controllers/leavecontroller");

// User routes
router.post("/apply", auth.authuser, leaveController.applyLeave);
router.get("/my", auth.authuser, leaveController.getMyLeaves);

// Admin/Manager routes
router.get("/all", auth.authuser, leaveController.getAllLeaves);
router.patch("/:id/status", auth.authuser, leaveController.updateLeaveStatus);

module.exports = router;
