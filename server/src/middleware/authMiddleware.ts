import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"


const authMiddleware = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (authHeader == null || authHeader == undefined) {
        return res.status(401).json({
            message: "unauthorized",
            status: 401
        })
    }

    const token = authHeader.split(" ")[1]

    jwt.verify(token, process.env.SECRET_KEY!, (err: any, user: any) => {
        if (err) return res.status(401).json({
            message: "unauthorized",
            status: 401
        })
        req.user = user
        next()
    })
}

export default authMiddleware