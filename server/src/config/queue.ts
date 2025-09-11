import { ConnectionOptions, DefaultJobOptions } from "bullmq";



export const redisConnection: ConnectionOptions = {
  
  url: process.env.REDIS_URL,
  //@ts-ignore
  socket: {
    tls: true,
    rejectUnauthorized: false,
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
