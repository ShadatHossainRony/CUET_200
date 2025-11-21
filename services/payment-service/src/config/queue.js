const { Queue } = require("bullmq");
const { Redis } = require("ioredis");

const redisConnection = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379",
    {
        maxRetriesPerRequest: null,
    }
);

const notificationQueue = new Queue("notifications", {
    connection: redisConnection,
});

// Queue job types
const queueNotification = {
    successTransaction: async (data) => {
        await notificationQueue.add("success_transaction", data);
    },
    failedTransaction: async (data) => {
        await notificationQueue.add("failed_transaction", data);
    },
};

module.exports = {
    queueNotification,
};