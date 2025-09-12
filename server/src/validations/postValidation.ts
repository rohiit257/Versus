import z from "zod";

export const PostScheme = z.object({
    title:z.string({message:"Title is Required"}).min(3,{message:"Title must be more than 3 characters"}),
    description:z.string({message:"Description is Required"}).min(10).max(2500),
    category:z.string({message:"Category Is Required"}),
    expire_at : z.string({message:"expired at is required"}).min(5),
  


})