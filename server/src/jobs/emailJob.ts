import { Job, Queue, Worker } from "bullmq";
import { redisConnection, defaultJobOptions } from "../config/queue.js";
import { sendMail } from "../config/mail.js";

export const emailQueueName = "emailQueue";

interface EmailJobData {
    to: string;
    subject: string;
    body: string;
}

export const emailQueue = new Queue(emailQueueName, {
    connection: redisConnection,
    defaultJobOptions: defaultJobOptions,
});


export const emailWorker = new Worker(emailQueueName, async (job: Job) => {
    const data:EmailJobData = job.data
    await sendMail(data.to, data.subject, data.body)
    console.log("Processing email job:", data);
},
    {
        connection: redisConnection,
    }

)