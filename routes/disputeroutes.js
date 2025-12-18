const express = require("express");
const router = express.Router();
const disputeController = require("../controllers/disputecontroller");
const auth = require("../middleware/auth");

// ====================== CREATE ======================
router.post("/create", auth.authuser, disputeController.createDispute);

// ====================== USER ROUTES ======================
router.get("/my", auth.authuser, disputeController.getMyDisputes);

// ====================== STATS (ADMIN) ======================
router.get(
  "/stats/all",
  auth.authuser,
  auth.authorizeRoles("admin"),
  disputeController.getDisputeStats
);

// ====================== LIST ======================
router.get("/", auth.authuser, disputeController.getAllDisputes);

// ====================== SINGLE ======================
router.get("/:id", auth.authuser, disputeController.getDisputeById);

// ====================== UPDATE ======================
router.put("/:id", auth.authuser, disputeController.updateDispute);

// ====================== DELETE ======================
router.delete(
  "/:id",
  auth.authuser,
  auth.authorizeRoles("admin"),
  disputeController.deleteDispute
);

module.exports = router;
