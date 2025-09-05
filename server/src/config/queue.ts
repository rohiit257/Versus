import { ConnectionOptions, DefaultJobOptions } from "bullmq";



export const redisConnection: ConnectionOptions = {
  //@ts-ignore
  connectionString: process.env.REDIS_URL,  
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
