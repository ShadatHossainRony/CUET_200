import { Worker } from "bullmq";
import { redisConnection } from "./queues/connection.js";
import { io } from "./index.js";

const notificationWorker = new Worker(
    "notifications",
    async (job) => {
        console.log(`Processing job: ${job.name} [ID: ${job.id}]`);

        try {
            switch (job.name) {
                case "task_assigned":
                    io.to(`user:${job.data.assignedTo}`).emit("task:assigned", {
                        taskId: job.data.taskId,
                        taskTitle: job.data.taskTitle,
                        assignedBy: job.data.assignedBy,
                        organizationId: job.data.organizationId,
                        timestamp: new Date(),
                    });
                    console.log(`✓ Task assigned notification sent to user:${job.data.assignedTo}`);
                    break;

                case "task_updated":
                    io.to(`user:${job.data.assignedTo}`).emit("task:updated", {
                        taskId: job.data.taskId,
                        taskTitle: job.data.taskTitle,
                        status: job.data.status,
                        updatedBy: job.data.updatedBy,
                        timestamp: new Date(),
                    });
                    console.log(`✓ Task updated notification sent to user:${job.data.assignedTo}`);
                    break;

                default:
                    console.warn(`Unknown job type: ${job.name}`);
            }
        } catch (error) {
            console.error(`Error processing job ${job.name}:`, error);
            throw error; // Re-throw to trigger retry
        }
    },
    {
        connection: redisConnection,
        concurrency: 5,
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    }
);

notificationWorker.on("completed", (job) => {
    console.log(`✓ Job ${job.id} completed successfully`);
});

notificationWorker.on("failed", (job, err) => {
    console.error(`✗ Job ${job?.id} failed:`, err.message);
});

notificationWorker.on("error", (err) => {
    console.error("Worker error:", err);
});

console.log("📨 Notification worker started and listening for jobs...");

export default notificationWorker;
