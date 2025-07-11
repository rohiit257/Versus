import { Server } from "socket.io";
import { votinQueue, votinQueueName } from "./jobs/votingJob.js";
import prisma from "./config/database.js";

export function setupSocket(io: Server) {
    io.on("connection", (socket) => {
        console.log("user connection", socket.id);
        
        socket.on("disconnect", () => {
            console.log("user disconnected");
        });

        // Handle voting events
        socket.on("vote", async (data: any) => {
            console.log("Vote received:", data);
            
            try {
                // Add vote to queue for processing
                await votinQueue.add(votinQueueName, data);
                
                // Wait a bit for the job to process, then fetch updated counts
                setTimeout(async () => {
                    try {
                        const updatedVoteCounts = await getUpdatedVoteCounts(data.post_id);
                        
                        // Emit updated vote counts to all clients
                        const voteUpdateData = {
                            post_id: data.post_id,
                            options: updatedVoteCounts.options,
                            total_votes: updatedVoteCounts.total,
                            user_vote: data.option_id,
                            user_id: data.user_id,
                            timestamp: new Date().toISOString()
                        };
                        
                        // Emit to all clients including the sender
                        io.emit("vote-update", voteUpdateData);
                        io.emit(`vote-update-${data.post_id}`, voteUpdateData);
                        
                        // Emit success to the voting user
                        socket.emit("vote-success", {
                            post_id: data.post_id,
                            option: data.option_id,
                            user_id: data.user_id
                        });
                        
                    } catch (error) {
                        console.error("Error fetching updated vote counts:", error);
                        socket.emit("vote-error", { 
                            error: "Failed to update vote counts", 
                            post_id: data.post_id 
                        });
                    }
                }, 1000); // Wait 1 second for the job to process
                
            } catch (error) {
                console.error("Error processing vote:", error);
                socket.emit("vote-error", { 
                    error: "Failed to process vote", 
                    post_id: data.post_id 
                });
            }
        });
    });
}

// Fetch actual vote counts from database using Prisma
async function getUpdatedVoteCounts(postId: string | number) {
    try {
        console.log("Fetching updated vote counts for post:", postId);
        
        // Get the post with all its options and their vote counts
        const post = await prisma.post.findUnique({
            where: { id: Number(postId) },
            include: {
                Option: {
                    select: {
                        id: true,
                        option: true,
                        count: true
                    }
                }
            }
        });
        
        if (!post) {
            throw new Error("Post not found");
        }
        
        const options = post.Option || [];
        const total = options.reduce((sum, opt) => sum + opt.count, 0);
        
        return {
            options: options.map(opt => ({
                id: opt.id,
                option: opt.option,
                count: opt.count
            })),
            total: total
        };
        
    } catch (error) {
        console.error("Error fetching vote counts:", error);
        throw error;
    }
}
