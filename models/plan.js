// models/Plan.js
const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: String,
  price: Number,
  duration: String,
  features: [String],
});

module.exports = mongoose.model("Plan", planSchema);
