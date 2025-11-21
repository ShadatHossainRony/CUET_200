import { Queue } from "bullmq";
import { redisConnection } from "./connection.js";

export const notificationQueue = new Queue("notifications", {
  connection: redisConnection,
});
