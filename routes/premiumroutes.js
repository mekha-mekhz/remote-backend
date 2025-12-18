const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const premiumController = require("../controllers/premiumcontroller");

// Only logged-in users
router.get("/report", auth.authuser, premiumController.getPremiumReport);

module.exports = router;

