// cron-jobs/subscription-cron.js
import cron from "node-cron";
import Subscription from "../models/provider-subscription-models.js";
// Runs every midnight (00:00)
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running daily subscription check...");

  try {
    const now = new Date();
    const expired = await Subscription.updateMany(
      { endDate: { $lt: now }, isActive: true },
      { $set: { isActive: false } }
    );

    if (expired.modifiedCount > 0) {
      console.log(` ${expired.modifiedCount} subscriptions expired.`);
    } else {
      console.log("No expired subscriptions found today.");
    }
  } catch (err) {
    console.error(" Error updating subscriptions:", err.message);
  }
});
