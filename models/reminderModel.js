const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    remindAt: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ["custom", "task", "leave", "dispute"],
      default: "custom"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", reminderSchema);
