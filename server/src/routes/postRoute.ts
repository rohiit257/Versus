import { Router, Request, Response } from "express";
import { PostScheme } from "../validations/postValidation.js";
import fileUpload, { UploadedFile } from "express-fileupload";
import { imageValidator, uploadImage } from "../helper..js";
import prisma from "../config/database.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { ZodError } from "zod";

const router = Router()

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // 🧪 Validate request body using Zod
    const payload = PostScheme.parse(body);

    // 📷 Handle image validation
    const image = req.files?.image as UploadedFile | undefined;

    if (!image) {
      return res.status(422).json({
        errors: { image: "Image field is required" },
      });
    }

    const imageError = imageValidator(image.size, image.mimetype);
    if (imageError) {
      return res.status(422).json({
        errors: { image: imageError },
      });
    }

    // ⬆️ Upload image and attach to payload
    payload.image = await uploadImage(image);

    // 💾 Create post in DB
    await prisma.post.create({
      data: {
        ...payload,
        user_id: req.user.id,
        expire_at: new Date(payload.expire_at),
      },
    });

    return res.status(200).json({
      message: "Post created successfully",
    });

  } catch (error) {
    // 🛑 Zod validation error
    if (error instanceof ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return res.status(422).json({
        errors: fieldErrors,
      });
    }

    // 🧠 Unexpected error
    console.error("Unexpected error while creating post:", error);

    return res.status(500).json({
      message: "Something went wrong while creating the post.",
    });
  }
});

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