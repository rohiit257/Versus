
import express, { type Application, type Response } from 'express'
import prisma from './config/db.js'
import cors from 'cors'
import { verifyToken, type AuthRequest } from "./middleware/verifyToken.js"
import dotenv from "dotenv";
dotenv.config();
const app:Application = express()

// Environment validation
console.log("🚀 [SERVER] Starting Analytics Service...")
console.log("🔧 [SERVER] Environment variables:")
console.log("  - SECRET_KEY:", process.env.SECRET_KEY ? "Set ✅" : "Missing ❌")
console.log("  - PORT:", process.env.PORT || "8001 (default)")
console.log("  - DATABASE_URL:", process.env.DATABASE_URL ? "Set ✅" : "Missing ❌")

if (!process.env.SECRET_KEY) {
  console.error("❌ [SERVER] CRITICAL: SECRET_KEY environment variable is required!")
  process.exit(1)
}

app.use(express.json())
app.use(
    cors({
      origin:'https://versus-chat.vercel.app/',
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true,
    })
  );
const PORT = process.env.PORT || 8001

app.listen(PORT,()=>{
    console.log(`🚀 [SERVER] Analytics Server Running On http://localhost:${PORT}`)
    console.log("📊 [SERVER] Available endpoints:")
    console.log("  - GET / - Health check")
    console.log("  - GET /stats - User analytics (requires auth)")
    console.log("  - GET /getComments - Comments endpoint")
})

app.get("/",(req,res)=>{
    console.log("🏥 [HEALTH] Health check requested")
    return res.json({ 
        status: "healthy", 
        service: "analytics-service",
        timestamp: new Date().toISOString()
    })
})

app.get('/stats', verifyToken, async(req:AuthRequest,res)=>{
    console.log("📊 [STATS] Stats endpoint requested")
    
    try {
        console.log("📊 [STATS] User ID from token:", req.userId)
        console.log("📊 [STATS] User object:", req.user ? "Present" : "Missing")
        
        if (!req.userId) {
            console.error("❌ [STATS] User ID not found in request")
            return res.status(403).json({ 
                message: "User ID not found in token", 
                status: 403,
                timestamp: new Date().toISOString()
            })
        }
        
        console.log("📊 [STATS] Querying database for user ID:", req.userId)
        
        // First get user's posts
        const userPosts = await prisma.post.findMany({
            where: { user_id: req.userId },
            select: { id: true }
        })
        const postIds = userPosts.map(p => p.id)
        
        const [postCount , commentCount, optionCount ] = await Promise.all([
            prisma.post.count({where:{user_id:req.userId}}),
            prisma.comments.count({where:{user_id:req.userId}}),
            prisma.option.count({where:{post_id: {in: postIds}}})
        ])
        
        console.log("✅ [STATS] Database queries completed:")
        console.log("  - Post count:", postCount)
        console.log("  - Comment count:", commentCount)
        console.log("  - Option count:", optionCount)
        
        const response = {
            postCount: postCount,
            commentCount: commentCount,
            optionCount: optionCount,
            timestamp: new Date().toISOString()
        }
        
        console.log("📊 [STATS] Sending response:", response)
        res.json(response)
        
    } catch (error) {
        console.error("❌ [STATS] Database query failed:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            userId: req.userId
        })
        
        res.status(500).json({
            message: "Database query failed",
            error: error instanceof Error ? error.message : "Unknown error",
            status: 500,
            timestamp: new Date().toISOString()
        })
    }
})


app.get('/getComments', verifyToken, async (req: AuthRequest, res) => {
    try {
      console.log("💬 [COMMENTS] Requested by user:", req.userId);
  
      const comments = await prisma.comments.findMany({
        where: { user_id: req.userId! }, 
        orderBy: { created_at: 'desc' }
      });
  
      res.json({
        comments,
        count: comments.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("❌ [COMMENTS] Query failed:", error);
      res.status(500).json({ message: "Database query failed", error });
    }
  });
  
app.get('/getCategoryData', verifyToken, async (req: AuthRequest, res) => {
    try {
      console.log("💬 [CATEGORY] Requested by user:", req.userId);
      const categoryData = await prisma.post.findMany({
        where: { user_id: req.userId! },
        select: { category: true }
      });
      res.json({ categoryData });
    } catch (error) {
      console.error("❌ [CATEGORY] Query failed:", error);
      res.status(500).json({ message: "Database query failed", error });
    }
  });
