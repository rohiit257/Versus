import { Router,Request,Response } from "express";
import { PostScheme } from "../validations/postValidation.js";
import fileUpload, { UploadedFile } from "express-fileupload";
import { imageValidator, uploadImage } from "../helper..js";
import prisma from "../config/database.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router()

router.post("/", authMiddleware, async (req:Request,res:Response) =>{
    try {
        const body  = req.body
        const paylaod = PostScheme.parse(body)
        
        if(req.files?.image){
            const image = req.files?.image as UploadedFile
            const validimage = imageValidator(image.size,image.mimetype)

            if(validimage){
                return res.status(422).json({
                    errors:{image:validimage}
                })
            }

            paylaod.image = await uploadImage(image)
        }
        else{
            return res.status(422).json({
                    errors:{image:"image field is required"}
                })
        }


        await prisma.post.create({
            data:{
                ...paylaod,
                user_id: req.user.id,
                expire_at: new Date(paylaod.expire_at)
            }
        })

        return res.status(200).json({
            message:"post created"
    
        })




    } catch (error) {
        
    }
})









export default router