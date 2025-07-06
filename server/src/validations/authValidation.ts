import {z} from 'zod';

export const RegisterSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
}) 

export const LoginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),      
    password: z.string({message: "Password is required"})
})

