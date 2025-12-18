const Task = require("../models/taskmodel");
const User = require("../models/usermodel");  


// Helper: Attach assignedTo & createdBy user data manually
const attachUserData = async (task) => {
  if (!task) return task;

  if (task.assignedTo) {
    task.assignedTo = await User.findById(task.assignedTo)
      .select("name email role position")
      .lean();
  }

  if (task.createdBy) {
    task.createdBy = await User.findById(task.createdBy)
      .select("name email role")
      .lean();
  }

  return task;
};

const { createNotification } = require("./notificationController");

exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, estimatedMinutes } = req.body;

    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only managers or admins can create tasks" });
    }

    const newTask = new Task({
      title,
      description,
      assignedTo,
      priority,
      estimatedMinutes: Number(estimatedMinutes) || 0,
      createdBy: req.user.id,
    });

    await newTask.save();

    // 🔔 Notification
    if (assignedTo) {
      await createNotification({
        title: "New Task Assigned",
        message: `You have been assigned a new task: ${title}`,
        type: "task",
        userId: assignedTo,
      });
    }

    // ✅ FIX — Correct population method
    const populatedTask = await Task.findById(newTask._id)
      .populate("assignedTo", "name email role position")
      .populate("createdBy", "name email role");

    res.status(201).json({
      message: "Task created successfully",
      task: populatedTask
    });

  } catch (err) {
    console.error("Error in createTask:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== GET ALL TASKS (Admin/Manager) ======================


exports.getAllTasks = async (req, res) => {
  try {
    let tasks;

    // Admin → get all tasks
    if (req.user.role === "admin") {
      tasks = await Task.find().lean();
    } 
    // Manager / User → only tasks they created
    else {
      tasks = await Task.find({ createdBy: req.user.id }).lean();
    }

    // Manually attach user data using findById
    const result = await Promise.all(
      tasks.map(async (task) => {
        const assignedUser = task.assignedTo
          ? await User.findById(task.assignedTo).select("name email role position").lean()
          : null;

        const creatorUser = task.createdBy
          ? await User.findById(task.createdBy).select("name email role").lean()
          : null;

        return {
          ...task,
          assignedTo: assignedUser,
          createdBy: creatorUser,
        };
      })
    );

    res.status(200).json({ tasks: result });
  } catch (err) {
    console.error("Error in getAllTasks:", err);
    res.status(500).json({ message: err.message });
  }
};



// ====================== GET TASK BY ID ======================
exports.getTaskById = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id).lean();

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Attach assigned user & creator user data
    task = await attachUserData(task);

    res.status(200).json({ task });
  } catch (err) {
    console.error("Error in getTaskById:", err);
    res.status(500).json({ message: err.message });
  }
};


// ====================== UPDATE TASK (Admin/Manager) ======================
exports.updateTask = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only managers/admins can update tasks" });
    }

    let task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!task) return res.status(404).json({ message: "Task not found" });

    task = await attachUserData(task);

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (err) {
    console.error("Error in updateTask:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== DELETE TASK ======================
exports.deleteTask = async (req, res) => {
  try {
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only managers/admins can delete tasks" });
    }

    const task = await Task.findById(req.params.id).lean();
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error in deleteTask:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== UPDATE TASK STATUS (User) ======================
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["todo", "in_progress", "done"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    let task = await Task.findById(req.params.id).lean();
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your task" });
    }

    await Task.findByIdAndUpdate(req.params.id, { status });

    res.status(200).json({ message: "Status updated" });
  } catch (err) {
    console.error("Error in updateStatus:", err);
    res.status(500).json({ message: err.message });
  }
};

// ====================== GET TASKS ASSIGNED TO LOGGED-IN USER ======================
exports.getTasksForUser = async (req, res) => {
  try {
    let tasks = await Task.find({ assignedTo: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const result = await Promise.all(tasks.map(t => attachUserData(t)));

    res.status(200).json({ tasks: result });
  } catch (err) {
    console.error("Error in getTasksForUser:", err);
    res.status(500).json({ message: err.message });
  }
};

