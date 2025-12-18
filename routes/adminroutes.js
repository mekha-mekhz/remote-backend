const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/roleMiddleware");
const adminController = require("../controllers/admincontroller");

/* ===================== USERS ===================== */
router.get(
  "/users",
  auth.authuser,
  role.onlyAdmin,
  adminController.getAllUsers
);

/* ===================== LEAVES ===================== */
router.get(
  "/leaves",
  auth.authuser,
  role.onlyAdmin,
  adminController.getAllLeaves
);

router.patch(
  "/leave/:id/status",
  auth.authuser,
  role.onlyAdmin,
  adminController.updateLeaveStatus
);

/* ===================== TASKS ===================== */
router.get(
  "/tasks",
  auth.authuser,
  role.onlyAdmin,
  adminController.getAllTasks
);

/* ===================== ADMIN STATS ===================== */
router.get(
  "/stats",
  auth.authuser,
  role.onlyAdmin,
  adminController.getAdminStats
);

module.exports = router;
