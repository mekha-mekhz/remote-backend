const express = require("express");
const router = express.Router();
const reminderController = require("../controllers/remindercontroller");
const auth = require("../middleware/auth");

// CREATE
router.post("/", auth.authuser, reminderController.createReminder);

// GET ALL (📋 Upcoming + Expired)
router.get("/my", auth.authuser, reminderController.getMyReminders);

// DELETE ❌
router.delete("/:id", auth.authuser, reminderController.deleteReminder);

module.exports = router;
