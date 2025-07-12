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
    const createdPost = await prisma.post.create({
      data: {
        ...payload,
        user_id: req.user.id,
        expire_at: new Date(payload.expire_at),
      },
    });

    return res.status(200).json({
      message: "Post created successfully",
      postId: createdPost.id,
      data: createdPost,
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
            },
            include: {
                Option: {
                    select: {
                        id: true,
                        option: true,
                        count: true
                    }
                }
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

// Move /all route BEFORE /:id route to avoid conflicts
router.get("/all", async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy:{
        created_at:"desc"
      },
      include:{
        Option:{
          select:{
            option:true,
            count:true,
            id:true
          }
        },
        Comments:{
          include:{
            user:{
              select:{
                id:true,
                name:true,
                email:true
              }
            }
          }
        },
        user:true
      }
    });

    return res.status(200).json({
      status: 200,
      message: "Posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({
      status: 500,
      message: "An error occurred while fetching posts",
    });
  }
});

// Now the /:id route comes AFTER specific routes
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log("Fetching post with ID:", id);
        
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: {
                Option: true,
                user: true
            }
        });

        console.log("Found post:", post);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        return res.status(200).json({
            data: post
        });
    } catch (error) {
        console.log("Error in /:id route:", error);
        return res.status(500).json({
            message: "Something went wrong",
            status: 500
        });
    }
});

//options route
router.post("/add-options", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { post_id, option1, option2 } = req.body;

    // Validation
    if (!post_id || !option1 || !option2) {
      return res.status(422).json({
        message: "post_id, option1, and option2 are required",
      });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: Number(post_id) },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Insert both options
    await prisma.option.createMany({
      data: [
        { option: option1, post_id: Number(post_id) },
        { option: option2, post_id: Number(post_id) },
      ],
    });

    return res.status(201).json({
      message: "Options added successfully",
    });

  } catch (error: any) {
    console.error("Add options error:", error);
    return res.status(500).json({
      message: "Internal server error while adding options",
    });
  }
});

router.get("/get-posts-option",authMiddleware,async (req:Request,res:Response)=>{
  try {
    
  } catch (error) {
    
  }
})

export default router