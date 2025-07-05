import { Router,Request,Response } from "express";
import { RegisterSchema } from "../validations/authValidation.js";
import prisma from "../config/database.js";
import bcrypt from "bcrypt";
import {v4 as uuid} from "uuid";
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
        if(user){
            return res.status(400).json({ message: "User already exists with this email" });
        }


        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(payload.password, salt);

        const token  = await bcrypt.hash(uuid(),salt);
        
        await prisma.user.create({
            data:{
                name:payload.name,
                email:payload.email,    
                password:hashedPassword
            }
        })
        return res.status(201).json({ message: "User registered successfully" });


    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
});




export default router;
