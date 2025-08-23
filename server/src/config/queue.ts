import { ConnectionOptions, DefaultJobOptions } from "bullmq";



export const redisConnection: ConnectionOptions = {
  connectionString: process.env.REDIS_URL,  // ✅ use connectionString not url
  socket: {
    tls: true,                             // ✅ force TLS
    rejectUnauthorized: false,             // ✅ required by Redis Cloud
  },
};

export const defaultJobOptions: DefaultJobOptions = {
  removeOnComplete: {
    count: 20,
    age: 60 * 60,
  },
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 3000,
  },
  removeOnFail: false,
};
