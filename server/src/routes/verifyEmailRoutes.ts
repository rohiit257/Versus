import e, { Router,Request,Response } from "express";
import prisma from "../config/database.js";

const router = Router();

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
            return res.status(200).json({ message: "Email verified successfully" });
        }
    }
    return res.status(400).json({ message: "Invalid verification link" });

})

export default router;