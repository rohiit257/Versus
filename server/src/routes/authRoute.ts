import { Router, Request, Response } from "express";
import { LoginSchema, RegisterSchema } from "../validations/authValidation.js";
import prisma from "../config/database.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { renderEmailEJS } from "../helper..js";
import { emailQueue, emailQueueName } from "../jobs/emailJob.js";
import jwt from "jsonwebtoken"
import authMiddleware from "../middleware/authMiddleware.js";
const router = Router();

router.post("/register", async (req: Request, res: Response) => {
    try {

        const body = req.body;
        const payload = RegisterSchema.parse(body)
        // res.json(payload)

        let user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        });
        if (user) {
            return res.status(400).json({ message: "User already exists with this email" });
        }


        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(payload.password, salt);

        const token = await bcrypt.hash(uuid(), salt);
        const url = `${process.env.APP_URL}/verify-email?email=${payload.email}&token=${token}`;

        const emailBody = await renderEmailEJS("email-veify", { name: payload.name, url: url });

        await emailQueue.add(emailQueueName, { to: payload.email, subject: "Versus Email Verification", body: emailBody });

        await prisma.user.create({

            data: {
                name: payload.name,
                email: payload.email,
                password: hashedPassword,
                email_verification_token: token,

            }
        })
        return res.status(201).json({ message: "Please Check Your Email" });


    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error" });

    }
});

router.post("/login", async (req:Request,res:Response) =>{
    try {

        const body = req.body
        const payload  = LoginSchema.parse(body)

        const user  =  await prisma.user.findUnique({where:{email:payload.email}})

        if(!user){
            return res.status(422).json({message:"User not found with this email"})
        }

        const isPasswordValid = await bcrypt.compare(payload.password, user.password)

        if(!isPasswordValid){
            return res.status(422).json({message:"Invalid Password"})
        }

        let jwtPayload = {
            id:user.id,
            name:user.name,
            email:user.email,
        }

        const token  = jwt.sign(jwtPayload , process.env.SECRET_KEY! , {expiresIn:"365d"})

        return res.json({
            message:"Logged In Succesfully",
            data : {
                ...jwtPayload,
                token: `Bearer ${token}`,

            }
        })

        
    } catch (error) {
        console.error("Error during Login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

router.get("/user" , authMiddleware , async (req:Request,res:Response) =>{
    const user = req.user
    if(user){
        return res.json({
        data : user
    })
    }

    return res.status(402).json({
        message:"Authorization Failed",
        status:402
    })
    
})




export default router;
