// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentcontroller = require("../controllers/paymentController");
const auth=require("../middleware/auth")
router.post("/create-checkout-session", auth.authuser,paymentcontroller.createCheckoutSession);

module.exports = router;
