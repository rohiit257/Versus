import { Job, Queue, Worker } from "bullmq";
import { redisConnection, defaultJobOptions } from "../config/queue.js";
import { sendMail } from "../config/mail.js";
import prisma from "../config/database.js";

export const commentQueueName = "commentQueue";

export const commentQueue = new Queue(commentQueueName, {
    connection: redisConnection,
    defaultJobOptions: {
        ...defaultJobOptions,
        delay: 500
    }
});

export const commentWorker = new Worker(commentQueueName, async (job: Job) => {
    try {
        const data = job.data;
        
        // Find user by email or ID
        let user = null;
        if (data.user_id && data.user_id !== "anonymous") {
            if (!isNaN(Number(data.user_id))) {
                // If user_id is a number, look up by ID
                user = await prisma.user.findUnique({
                    where: { id: Number(data.user_id) }
                });
            } else if (typeof data.user_id === 'string' && data.user_id.includes('@')) {
                // If user_id is a string and looks like an email, look up by email
                user = await prisma.user.findUnique({
                    where: { email: data.user_id }
                });
            }
        }
        
        // Create a new comment with user information
        const comment = await prisma.comments.create({
            data: {
                comment: data.content,
                post_id: Number(data.post_id),
                user_id: user ? user.id : 1, // Default to user ID 1 if no user found
                created_at: new Date()
            }
        });
        
        console.log(`Comment created successfully: ${comment.id} by user: ${user?.name || 'Anonymous'}`);
        return comment;
        
    } catch (err) {
        console.error(`Error processing comment job ${job.id}:`, err);
        throw err; // Let BullMQ handle retries
    }
}, {
    connection: redisConnection,
});

// Handle worker events
commentWorker.on('completed', (job) => {
    if (job) {
        console.log(`Comment job ${job.id} completed successfully`);
    }
});

commentWorker.on('failed', (job, err) => {
    if (job) {
        console.error(`Comment job ${job.id} failed:`, err);
    } else {
        console.error('Comment job failed:', err);
    }
});