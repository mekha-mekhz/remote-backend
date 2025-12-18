const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskcontroller");
const { authuser, authorizeRoles } = require("../middleware/auth");

// ====================== TASK ROUTES ======================

// Create a new task (admin/manager only)
router.post("/", authuser, authorizeRoles("admin", "manager"), taskController.createTask);

// Get all tasks (admin/manager)
router.get("/", authuser, authorizeRoles("admin", "manager"), taskController.getAllTasks);

// Get a single task by ID (any authenticated user)
router.get("/:id", authuser, taskController.getTaskById);

// Update a task (admin/manager)
router.put("/:id", authuser, authorizeRoles("admin", "manager"), taskController.updateTask);

// Delete a task (admin/manager)
router.delete("/:id", authuser, authorizeRoles("admin", "manager"), taskController.deleteTask);

// Update task status (assigned user)
router.put("/status/:id", authuser, taskController.updateStatus);

// Get tasks assigned to logged-in user
router.get("/user/tasks", authuser, taskController.getTasksForUser);

module.exports = router;
