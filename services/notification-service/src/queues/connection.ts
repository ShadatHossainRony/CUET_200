import { Redis } from "ioredis";
import "dotenv/config";

export const redisConnection = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379",
    {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    }
);

redisConnection.on("connect", () => {
    console.log("✓ Connected to Redis");
});

redisConnection.on("error", (err) => {
    console.error("Redis connection error:", err);
});
