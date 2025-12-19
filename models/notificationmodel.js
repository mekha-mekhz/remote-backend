const mongoose=require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: ["task", "deadline", "warning", "info", "system"],
      default: "info",
    },

    read: { type: Boolean, default: false },

    // Specific user (optional)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // Notify an entire role (admin, manager, user)
    role: {
      type: String,
      enum: ["admin", "manager", "user", "all"],
      default: "null",
    },
  },
  { timestamps: true }
);

module.exports= mongoose.model("Notification", notificationSchema);
