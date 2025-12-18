const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const productivityController = require("../controllers/dailyreportcontroller");

// Get daily report for logged-in user
router.get("/report/daily", auth.authuser, productivityController.getDailyReport);

module.exports = router;