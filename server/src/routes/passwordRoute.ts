import { Router, Request, Response } from "express";
import prisma from "../config/database.js";
import { ForgetpwSchema, resetpwSchema } from "../validations/authValidation.js";
import { authlimiter } from "../config/rateLimit.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { renderEmailEJS, timeDiff } from "../helper..js";
import { emailQueue, emailQueueName } from "../jobs/emailJob.js";



const router = Router();
//@ts-ignore
router.post("/forget-password", authlimiter, async (req: Request, res: Response) => {
    try {
        const body = req.body
        const payload = ForgetpwSchema.parse(body)

        let user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        })

        if (!user || user === null) {
            return res.json({
                message: "User Doesnt Exits With this email",
                status: 422
            })
        }

        const salt = await bcrypt.genSalt(10)
        const token = await bcrypt.hash(uuid(), salt)

        await prisma.user.update({
            data: {
                password_reset_token: token,
                token_send_at: new Date().toISOString()
            },
            where: {
                email: payload.email
            }
        })

        const url = `${process.env.CLIENT_URL}/reset-password?email=${payload.email}&token=${token}`

        const emailbody = await renderEmailEJS("forgetpw", { url: url })

        await emailQueue.add(emailQueueName, { to: payload.email, subject: "Reset Password", body: emailbody });

        return res.json({
            message: "Password Reset Email Sent to Your mail please check it now",
            status: 200
        })


    } catch (error) {
        console.error("somethin went wrong:", error);
        res.status(500).json({ message: "Internal server error" });

    }




})
//@ts-ignore
router.post("/reset-password", authlimiter, async (req, res) => {
    try {
        const body = req.body
        const payload = resetpwSchema.parse(body)

        const user = await prisma.user.findUnique({ where: { email: payload.email } })

        if (!user) {
            return res.json({
                message: "invalid data",
                status: 422
            })
        }

        if (user.password_reset_token != payload.token) {
            return res.json({
                message: "invalid data",
                status: 422
            })
        }

        const hoursDiff = timeDiff(user.token_send_at!)

        if (hoursDiff > 2) {
            return res.json({
                message: "password token expired",
                status: 422
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPw = await bcrypt.hash(payload.password,salt)

        await prisma.user.update({
            data: {
                password: hashPw,
                password_reset_token: null,
                token_send_at: null
            },
            where: {
                email: payload.email
            }
        })

        return res.status(200).json({
            message: "password reset succesfully",
            status: 200
        })


    } catch (error) {
        console.error("somethin went wrong:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})


export default router