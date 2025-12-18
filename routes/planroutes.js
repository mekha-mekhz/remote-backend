// routes/planRoutes.js
const express = require("express");
const router = express.Router();
const Plan = require("../models/plan");

// Add a new plan
router.post("/", async (req, res) => {
  try {
    const { name, price, features } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }

    const newPlan = new Plan({
      name,
      price,
      features: features || [],
    });

    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all plans
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
