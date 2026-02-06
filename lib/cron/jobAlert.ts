import { CronJob } from "cron";

import { runAlerts } from "@/lib/alert/runAlert";

// every day at 8am
export const dailyCron = new CronJob(
  "0 0 8 * * *",
  async () => {
    await runAlerts("daily");
  },
  null,
  true,
  "Asia/Jakarta",
);

// every monday at 8am
export const weeklyCron = new CronJob(
  "0 0 8 * * 1",
  async () => {
    await runAlerts("weekly");
  },
  null,
  true,
  "Asia/Jakarta",
);

// every 30 seconds
// export const dev = new CronJob(
//   "*/30 * * * * *",
//   async () => {
//     const job = await runAlerts("daily");
//     console.log("Cron job running every 30 seconds", job, new Date());
//   },
//   null,
//   true,
//   "Asia/Jakarta",
// );
