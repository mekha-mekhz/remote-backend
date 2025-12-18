const Message = require("../models/messagemodel");
const User = require("../models/usermodel");
const Task = require("../models/taskmodel");

// Helper: attach user info and task info manually
const attachMessageData = async (message) => {
  if (!message) return message;

  const sender = await User.findById(message.sender)
    .select("name email role")
    .lean();
  const receiver = await User.findById(message.receiver)
    .select("name email role")
    .lean();

  let task = null;
  if (message.taskId) {
    task = await Task.findById(message.taskId).select("title").lean();
  }

  return {
    ...message,
    sender,
    receiver,
    taskId: task, // attach task object with title
  };
};

// ====================== SEND MESSAGE ===========================
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, taskId, message } = req.body;

    if (!message && !taskId && !req.files?.length) {
      return res.status(400).json({ message: "Message, file, or task required" });
    }

    const newMsg = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      taskId: taskId || null,
      message,
      attachments: req.files?.map((f) => f.path) || [],
    });

    const finalMsg = await Message.findById(newMsg._id).lean();
    const enriched = await attachMessageData(finalMsg);

    res.status(201).json({ success: true, message: enriched });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// ====================== GET CONVERSATION ===========================
exports.getConversation = async (req, res) => {
  try {
    const { withUserId } = req.params;

    const msgs = await Message.find({
      $or: [
        { sender: req.user.id, receiver: withUserId },
        { sender: withUserId, receiver: req.user.id },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    const result = await Promise.all(msgs.map(async (m) => await attachMessageData(m)));

    res.status(200).json({ success: true, messages: result });
  } catch (err) {
    console.error("Conversation error:", err);
    res.status(500).json({ message: "Failed to load chat" });
  }
};

// ====================== GET ALL CHAT LIST FOR USER ===========================
exports.getMyChats = async (req, res) => {
  try {
    const msgs = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const uniqueUsers = {};

    msgs.forEach((msg) => {
      const other =
        msg.sender.toString() === req.user.id
          ? msg.receiver.toString()
          : msg.sender.toString();

      if (!uniqueUsers[other]) {
        uniqueUsers[other] = msg; // store latest
      }
    });

    const chatList = await Promise.all(
      Object.values(uniqueUsers).map(async (msg) => {
        const userId =
          msg.sender.toString() === req.user.id ? msg.receiver : msg.sender;

        const user = await User.findById(userId)
          .select("name email role")
          .lean();

        let task = null;
        if (msg.taskId) {
          task = await Task.findById(msg.taskId).select("title").lean();
        }

        return {
          user,
          lastMessage: msg.message,
          time: msg.createdAt,
          taskId: task,
        };
      })
    );

    res.status(200).json({ success: true, chats: chatList });
  } catch (err) {
    console.error("Chat fetch error:", err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};
// Get messages for tasks assigned to this manager
exports.getTaskMessages = async (req, res) => {
  try {
    const tasks = await Task.find({ manager: req.user.id }).select("_id");
    const taskIds = tasks.map(t => t._id);

    const messages = await Message.find({ taskId: { $in: taskIds } })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch task messages" });
  }
};
