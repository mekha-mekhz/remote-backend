const express = require("express");
const router = express.Router();
const authcontroller = require("../controllers/authcontroller");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// Register
router.post("/register", upload.single("profilePhoto"), authcontroller.createUser);

// Login
router.post("/login", authcontroller.loginUser);

// Get all users (admin only)
router.get(
  "/users",
  auth.authuser,
  auth.authorizeRoles("admin"),
  authcontroller.getAllUsers
);

// Get logged-in user
router.get("/me", auth.authuser, authcontroller.getLoggedUser);

// Admin dashboard
router.get(
  "/admin/dashboard",
  auth.authuser,
  auth.authorizeRoles("admin"),
  authcontroller.adminDashboard
);

// Logout
router.get("/logout", authcontroller.logoutUser);
// Update user (admin only)
router.put(
  "/user/:id",
  auth.authuser,
  auth.authorizeRoles("admin"),
  authcontroller.updateUser
);

// Delete user (admin only)
router.delete(
  "/user/:id",
  auth.authuser,
  auth.authorizeRoles("admin"),
  authcontroller.deleteUser
);
router.post("/upgrade", auth.authuser, authcontroller.upgradeToPremium);
router.put("/verify/:id", auth.authuser, auth.authorizeRoles("admin"), authcontroller.verifyUser);

// Pending approval list
router.get("/pending-users", authcontroller.getPendingUsers);

// Approve user
router.put("/approve/:userId", authcontroller.approveUser);

// Reject user
router.delete("/reject/:userId", authcontroller.rejectUser);

router.get("/user/all",authcontroller.getUsers)
router.get("/managers", auth.authuser,authcontroller.managers)
router.post("/forgot-password", authcontroller.forgotpassword);
router.post("/reset-password", authcontroller.resetpassword);
router.get("/status", auth.authuser,authcontroller.getstatus)
  router.put("/status", auth.authuser,authcontroller.updatestatus)
  router.get("/all-status", auth.authuser,authcontroller.allstatus)
module.exports = router;
