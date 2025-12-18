const express = require("express");
const router = express.Router();
const { getAdminStats } = require("../controllers/adminontroller");
const { authUser } = require("../middleware/auth");

router.get("/admin/stats", authUser, getAdminStats);
module.exports=router