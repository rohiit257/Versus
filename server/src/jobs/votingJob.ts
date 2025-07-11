import { Job, Queue, Worker } from "bullmq";
import { redisConnection, defaultJobOptions } from "../config/queue.js";
import { sendMail } from "../config/mail.js";
import prisma from "../config/database.js";

export const votinQueueName = "votingQueue";



export const votinQueue = new Queue(votinQueueName, {
    connection: redisConnection,
    defaultJobOptions: {
        ...defaultJobOptions,
        delay:500
    }
});


export const votingWorker = new Worker(votinQueueName,     async (job: Job) => {
        try {
            const data = job.data;
            await prisma.option.update({
                where: {
                    id: Number(data.option_id),
                },
                data: {
                    count: {
                        increment: 1,
                    },
                },
            });
        } catch (err) {
            console.error(`Error processing job ${job.id}:`, err);
            throw err; // Let BullMQ handle retries
        }
    },

    {
        connection: redisConnection,
    }

)