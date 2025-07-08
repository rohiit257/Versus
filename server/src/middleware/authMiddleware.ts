import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader == null || authHeader == undefined) {
        return res.status(401).json({
            message: "unauthorized",
            status: 401
        });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.SECRET_KEY!, (err: any, decoded: any) => {
        if (err) {
            console.log("JWT Error:", err);
            return res.status(401).json({
                message: "unauthorized",
                status: 401
            });
        }

        // Debug: Check what's in the decoded token
        console.log("Decoded JWT payload:", decoded);
        
        // The issue is likely here - check what property contains the user ID
        // Common JWT payload structures:
        // Option 1: { id: 15, email: "...", ... }
        // Option 2: { userId: 15, email: "...", ... }
        // Option 3: { sub: 15, email: "...", ... }
        // Option 4: { user: { id: 15, email: "..." } }

        req.user = decoded;
        
        // Additional debug info
        console.log("Setting req.user to:", decoded);
        console.log("req.user.id:", decoded.id);
        console.log("req.user.userId:", decoded.userId);
        console.log("req.user.sub:", decoded.sub);
        
        next();
    });
};

export default authMiddleware;