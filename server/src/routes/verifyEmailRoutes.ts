import { Router,Request,Response } from "express";
import prisma from "../config/database.js";

const router = Router();
//@ts-ignore
router.get("/verify-email",async (req:Request,res:Response) => {
    const { email, token } = req.query;
    if (!email || !token) {
        return res.status(400).json({ message: "Invalid request" });
    }
    const user = await prisma.user.findUnique({
        where: {        
            email: String(email),
            email_verification_token: String(token)
        } 
    });  

    if(user){
        if(token == user.email_verification_token){
            await prisma.user.update({
                where: { email: String(email) },
                data: {email_verification_token: null, email_verified_at: new Date().toISOString()}
            });
            return res.redirect(process.env.FRONTEND_URL || "https://versus-chat.vercel.app//verified");
        }
        
        
    }
    return res.status(400).json({ message: "Invalid verification link" });

})

export default router;