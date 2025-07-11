import { Server } from "socket.io";
import { votinQueue, votinQueueName } from "./jobs/votingJob.js";

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
                
                // You should get the updated vote counts from your database
                // This is a placeholder - replace with your actual vote counting logic
                const updatedVoteCounts = await getUpdatedVoteCounts(data.post_id);
                
                // Emit updated vote counts to all clients
                const voteUpdateData = {
                    post_id: data.post_id,
                    optionA_votes: updatedVoteCounts.optionA,
                    optionB_votes: updatedVoteCounts.optionB,
                    total_votes: updatedVoteCounts.total,
                    user_vote: data.option, // A or B
                    timestamp: new Date().toISOString()
                };
                
                // Emit to all clients including the sender
                io.emit("vote-update", voteUpdateData);
                io.emit(`vote-update-${data.post_id}`, voteUpdateData);
                
            } catch (error) {
                console.error("Error processing vote:", error);
                socket.emit("vote-error", { 
                    error: "Failed to process vote", 
                    post_id: data.post_id 
                });
            }
        });

        // Handle legacy voting events (for backward compatibility)
        socket.onAny(async (eventName: string, data: any) => {
            if (eventName.startsWith("voting-")) {
                console.log("Legacy voting event:", eventName, data);
                
                try {
                    // Add vote to queue for processing
                    await votinQueue.add(votinQueueName, data);
                    
                    // Get updated vote counts
                    const updatedVoteCounts = await getUpdatedVoteCounts(data.post_id);
                    
                    // Emit updated vote counts
                    const voteUpdateData = {
                        post_id: data.post_id,
                        optionA_votes: updatedVoteCounts.optionA,
                        optionB_votes: updatedVoteCounts.optionB,
                        total_votes: updatedVoteCounts.total,
                        user_vote: data.option,
                        timestamp: new Date().toISOString()
                    };
                    
                    // Emit to all clients
                    io.emit("vote-update", voteUpdateData);
                    io.emit(`vote-update-${data.post_id}`, voteUpdateData);
                    
                } catch (error) {
                    console.error("Error processing legacy vote:", error);
                    socket.emit("vote-error", { 
                        error: "Failed to process vote", 
                        post_id: data.post_id 
                    });
                }
            }
        });
    });
}

// This function should fetch the updated vote counts from your database
// Replace this with your actual database query
async function getUpdatedVoteCounts(postId: string | number) {
    // Example implementation - replace with your actual database logic
    try {
        // This should query your database to get the current vote counts
        // const post = await Post.findById(postId).populate('options');
        // return {
        //     optionA: post.options[0].votes,
        //     optionB: post.options[1].votes,
        //     total: post.options[0].votes + post.options[1].votes
        // };
        
        // Placeholder - replace with actual database query
        console.log("Fetching updated vote counts for post:", postId);
        
        // Return mock data for now - replace with real database query
        return {
            optionA: Math.floor(Math.random() * 100) + 1,
            optionB: Math.floor(Math.random() * 100) + 1,
            total: 0 // Will be calculated
        };
        
    } catch (error) {
        console.error("Error fetching vote counts:", error);
        throw error;
    }
}
