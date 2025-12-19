const express = require("express");
const router = express.Router();

// Middleware
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// Controller
const messageController = require("../controllers/messageController");

// ====================== SEND MESSAGE ===========================
// Send a message to any user (user ↔ manager, manager ↔ admin)
router.post(
  "/send",
  auth.authuser,          // Protect route, user must be logged in
  upload.array("files"),  // Optional attachments
  messageController.sendMessage
);

// ====================== GET CONVERSATION ===========================
// Get all messages between logged-in user and another user
router.get(
  "/conversation/:withUserId",
  auth.authuser,
  messageController.getConversation
);

// ====================== GET MY CHATS ===========================
// Get latest message per conversation for logged-in user
router.get("/chats", auth.authuser, messageController.getMyChats);

// ====================== GET TASK MESSAGES ===========================
// Get messages for all tasks assigned to the logged-in manager
router.get("/task-messages", auth.authuser, messageController.getTaskMessages);

module.exports = router;
