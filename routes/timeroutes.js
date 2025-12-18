const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const timeController = require("../controllers/timecontroller");

// Start timer
router.post("/start", auth.authuser, timeController.startTimer);

// Stop timer
router.put("/stop/:entryId", auth.authuser, timeController.stopTimer);

// Ping timer (keep active)
router.put("/ping/:entryId", auth.authuser, timeController.pingTimer);

// Get logged-in user entries
router.get("/my", auth.authuser, timeController.getMyEntries);

// Get all entries (admin/manager)
router.get("/all", auth.authuser, timeController.getAllEntries);

module.exports = router;
