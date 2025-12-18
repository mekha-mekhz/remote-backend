const cron = require("node-cron");
const Reminder = require("../models/reminderModel");

cron.schedule("* * * * *", async () => {
  const now = new Date();

  const reminders = await Reminder.find({
    remindAt: { $lte: now },
    isSent: false
  }).populate("user");

  for (let r of reminders) {
    console.log(`🔔 Reminder for ${r.user.email}: ${r.title}`);

    // TODO: email / notification / socket
    r.isSent = true;
    await r.save();
  }
});
