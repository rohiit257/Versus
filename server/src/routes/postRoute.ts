import { Router, Request, Response } from "express";
import { PostScheme } from "../validations/postValidation.js";
import fileUpload, { UploadedFile } from "express-fileupload";
import { imageValidator, uploadImage } from "../helper..js";
import prisma from "../config/database.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { number } from "zod/v4";

const router = Router()

router.post("/", authMiddleware, async (req: Request, res: Response) => {
    try {
        const body = req.body
        const paylaod = PostScheme.parse(body)

        if (req.files?.image) {
            const image = req.files?.image as UploadedFile
            const validimage = imageValidator(image.size, image.mimetype)

            if (validimage) {
                return res.status(422).json({
                    errors: { image: validimage }
                })
            }

            paylaod.image = await uploadImage(image)
        }
        else {
            return res.status(422).json({
                errors: { image: "image field is required" }
            })
        }


        await prisma.post.create({
            data: {
                ...paylaod,
                user_id: req.user.id,
                expire_at: new Date(paylaod.expire_at)
            }
        })

        return res.status(200).json({
            message: "post created"

        })




    } catch (error) {

    }
})

router.get("/", authMiddleware, async (req: Request, res: Response) => {
    try {

        const post = await prisma.post.findMany({
            where: {
                user_id: req.user.id
            }
        })

        if (!post) {
            return res.json({
                status: 422,
                message: "No post found Please make your first post "
            })
        }

        return res.status(200).json({
            data: post,
            message: "Post Successfully Fetched"
        })




    } catch (error) {
        return res.json({
            error: error,
            message: 'something went wrong'
        })
    }
})

router.get("/:id", authMiddleware, async (req: Response, res: Response) => {
    try {
        const { id } = req.params
        const post = await prisma.post.findUnique({
            where: {
                id: Number(id)
            }
        })

        return res.status(200).json({
            data: post
        })
    } catch (error) {
        console.log(error)
        return res.json({
            message: "something went wrong",
            status: 422
        })
    }
})









export default router