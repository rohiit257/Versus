
import type{ NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

export interface AuthRequest extends Request {
  userId?: number
  user?: any
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log("🔐 [VERIFY_TOKEN] Starting token verification...")
    
    const authHeader = req.headers.authorization
    console.log("🔐 [VERIFY_TOKEN] Auth header received:", authHeader ? "Present" : "Missing")
    
    if (!authHeader) {
      console.error("❌ [VERIFY_TOKEN] No authorization header provided")
      return res.status(401).json({ message: "unauthorized", status: 401 })
    }

    
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader

    console.log("🔐 [VERIFY_TOKEN] Token extracted:", token ? `${token.substring(0, 20)}...` : "No token")
    console.log("🔐 [VERIFY_TOKEN] Full token for debugging:", token)
    
    // Check if SECRET_KEY is available
    if (!process.env.SECRET_KEY) {
      console.error("❌ [VERIFY_TOKEN] SECRET_KEY environment variable is not set!")
      return res.status(500).json({ message: "Server configuration error", status: 500 })
    }
    
    console.log("🔐 [VERIFY_TOKEN] SECRET_KEY is available:", process.env.SECRET_KEY ? "Yes" : "No")

    jwt.verify(token as string, process.env.SECRET_KEY!, (err, decoded: any) => {
      if (err) {
        console.error("❌ [VERIFY_TOKEN] JWT verification failed:", {
          error: err.message,
          name: err.name,
          expiredAt: (err as any).expiredAt
        })
        return res.status(401).json({ 
          message: "Invalid or expired token", 
          status: 401,
          error: err.message 
        })
      }

      console.log("✅ [VERIFY_TOKEN] JWT verified successfully")
      console.log("🔐 [VERIFY_TOKEN] Decoded token payload:", {
        id: decoded?.id,
        userId: decoded?.userId,
        sub: decoded?.sub,
        email: decoded?.email,
        name: decoded?.name
      })

      // Try to extract user ID from different possible fields
      if (decoded?.id) {
        req.userId = Number(decoded.id)
        console.log("✅ [VERIFY_TOKEN] User ID extracted from 'id' field:", req.userId)
      } else if (decoded?.userId) {
        req.userId = Number(decoded.userId)
        console.log("✅ [VERIFY_TOKEN] User ID extracted from 'userId' field:", req.userId)
      } else if (decoded?.sub) {
        req.userId = Number(decoded.sub)
        console.log("✅ [VERIFY_TOKEN] User ID extracted from 'sub' field:", req.userId)
      } else if (decoded?.user?.id) {
        req.userId = Number(decoded.user.id)
        console.log("✅ [VERIFY_TOKEN] User ID extracted from 'user.id' field:", req.userId)
      }

      req.user = decoded

      if (!req.userId) {
        console.error("❌ [VERIFY_TOKEN] No user ID found in token payload. Available fields:", Object.keys(decoded || {}))
        return res.status(401).json({ 
          message: "Invalid token payload - no user ID found", 
          status: 401,
          availableFields: Object.keys(decoded || {})
        })
      }

      console.log("✅ [VERIFY_TOKEN] Token verification completed successfully for user ID:", req.userId)
      next()
    })
  } catch (error) {
    console.error("❌ [VERIFY_TOKEN] Unexpected error in middleware:", error)
    return res.status(500).json({ 
      message: "Internal server error", 
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
