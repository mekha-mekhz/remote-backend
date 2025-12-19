// Import required packages

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();

// Middleware to parse cookies

app.use(cookieParser());

// Middleware to parse JSON and form data

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database

const connectdb = require("./config/db");
connectdb();

// Import routes

const authRoutes = require("./routes/authroutes");
const taskRoutes = require("./routes/taskroutes");
const timeRoutes = require("./routes/timeroutes");
const attendanceRoutes = require("./routes/attendanceroutes");
const leaveRoutes = require("./routes/leaveroutes");
const productivityRoutes = require("./routes/dailreprtroutes");
const adminRoutes = require("./routes/adminroutes");
const notificationRoutes = require("./routes/notificationRoutes");
const paymentRoutes = require("./routes/paymentroutes");
const planRoutes = require("./routes/planroutes");
const premiumRoutes = require("./routes/premiumroutes");
const disputeRoutes = require("./routes/disputeroutes");
const productRoutes = require("./routes/productivityroutes");
const chatRoutes = require("./routes/messageroutes");
const reminderRoutes = require("./routes/reminderRoutes");

// CORS configuration

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://remote-frontend.onrender.com",
    ],
    credentials: true,
  })
);

// Base route

app.get("/", (req, res) => {
  res.send("WELCOME TO REMOTE WORK TRACKER");
});

// API routes

app.use("/api", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/time", timeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/productivity", productivityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/pay", paymentRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/productivitys", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/messages", chatRoutes);
app.use("/api/reminders", reminderRoutes);

// Start server

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
