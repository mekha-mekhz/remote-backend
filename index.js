const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
require("./utils/reminderJob");

app.use(express.urlencoded({ extended: true }));
require("dotenv").config();

const port = process.env.PORT || 8000;
app.use(express.json());

const connectdb = require("./config/db");
const authuser = require("./routes/authroutes");
const taskRoutes = require("./routes/taskroutes");
const timeroutes = require("./routes/timeroutes");
const attendanceroutes = require("./routes/attendanceroutes");
const leaveroutes = require("./routes/leaveroutes");
const productivityroutes = require("./routes/dailreprtroutes");
const adminRoutes = require("./routes/adminroutes");
const notificationroutes = require("./routes/notificationRoutes");
const paymentRoutes = require("./routes/paymentroutes");
const planRoutes = require("./routes/planroutes");
const premiumRoutes = require("./routes/premiumroutes");
const disputeroutes = require("./routes/disputeroutes");
const productroutes = require("./routes/productivityroutes");
const chatroutes = require("./routes/messageroutes");
const reminderRoutes=require("./routes/reminderRoutes")
connectdb();
var cors = require("cors");
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://remotework-tracker-frontend.onrender.com",
    ],

    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.send("WELCOME TO REMOTE WORK TRACKER ");
});

app.use("/api", authuser);
app.use("/api/tasks", taskRoutes);
app.use("/api/time", timeroutes);
app.use("/api/attendance", attendanceroutes);
app.use("/api/leave", leaveroutes);
app.use("/api/productivity", productivityroutes);

app.use("/api/notifications", notificationroutes);
app.use("/api/pay", paymentRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/disputes", disputeroutes);
app.use("/api/productivitys", productroutes);
app.use("/api/admin",adminRoutes)
app.use("/api/plans", planRoutes);
app.use("/api/messages", chatroutes);
app.use("/api/reminders", reminderRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Listening to port number http://localhost:${port}`);
});
