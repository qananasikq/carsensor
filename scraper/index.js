const cron = require("node-cron");
const { runWorker } = require("./worker");

let isRunning = false;

async function guardedRun() {
  if (isRunning) {
    console.log("Previous run is still in progress, skipping");
    return;
  }

  isRunning = true;
  try {
    await runWorker();
  } catch (error) {
    console.error("Scheduled run failed:", error);
  } finally {
    isRunning = false;
  }
}

guardedRun();
cron.schedule("0 * * * *", guardedRun);
console.log("Hourly schedule is enabled");
