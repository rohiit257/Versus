"use client"
import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from "react-hook-form"
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { motion } from "framer-motion"
import { User, Mail, Lock, CheckCircle2, Loader2 } from "lucide-react"
import Link from 'next/link'
import axios from 'axios'
import { toast } from "sonner"

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain a lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain a number" })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain a special character" }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export default function Register() {
    const [isLoading, setIsLoading] = useState(false)
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const onSubmit = async (formData: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        setSubmitMessage(null)

        try {
            // Send all form data including confirmPassword to match backend schema
            const cleanedData = {
                name: formData.name?.trim(),
                email: formData.email?.trim(),
                password: formData.password,
                confirmPassword: formData.confirmPassword 
            }
            
            if (!cleanedData.name || !cleanedData.email || !cleanedData.password || !cleanedData.confirmPassword) {
                setSubmitMessage({ type: 'error', message: 'All fields are required.' })
                setIsLoading(false)
                return
            }
            
            const response = await axios.post("http://localhost:8000/api/auth/v1/register", cleanedData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000, // 10 second timeout
            })
            
            if (response.status === 200 || response.status === 201) {
                setSubmitMessage({ type: 'success', message: 'Registration successful!' })
                toast("Registration successful")
                
                form.reset()
                
             
            }
        } catch (error: any) {
            console.error("Registration error:", error)
            console.error("Error response:", error.response?.data)
            
            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                const errorData = error.response.data
                let errorMessage = 'Registration failed. Please try again.'
                
                // Handle validation errors
                if (errorData?.errors && Array.isArray(errorData.errors)) {
                    errorMessage = errorData.errors.map((err: any) => err.message).join(', ')
                } else if (errorData?.message) {
                    errorMessage = errorData.message
                } else if (errorData?.error) {
                    errorMessage = errorData.error
                }
                
                setSubmitMessage({ type: 'error', message: errorMessage })
            } else if (error.request) {
                // Network error
                setSubmitMessage({ type: 'error', message: 'Network error. Please check your connection.' })
            } else {
                // Other error
                setSubmitMessage({ type: 'error', message: 'An unexpected error occurred.' })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <Card className="bg-neutral-900 border border-neutral-800 shadow-2xl rounded-2xl">
                    <CardHeader className="text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="flex justify-center mb-2"
                        >
                            <CheckCircle2 className="text-white text-4xl bg-black rounded-full border-2 border-white p-2" />
                        </motion.div>
                        <CardTitle className="text-3xl font-extrabold text-white tracking-tight">Create Account</CardTitle>
                        <CardDescription className="text-neutral-400 mt-2">Join Versus and start your journey</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Display success/error message */}
                                {submitMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-3 rounded-lg text-sm font-medium ${
                                            submitMessage.type === 'success' 
                                                ? 'bg-green-900/50 text-green-300 border border-green-700' 
                                                : 'bg-red-900/50 text-red-300 border border-red-700'
                                        }`}
                                    >
                                        {submitMessage.message}
                                    </motion.div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white flex items-center gap-2">
                                                <User className="text-neutral-400 w-4 h-4" /> Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your Name"
                                                    {...field}
                                                    disabled={isLoading}
                                                    className="bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:ring-2 focus:ring-white/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white flex items-center gap-2">
                                                <Mail className="text-neutral-400 w-4 h-4" /> Email
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="you@example.com"
                                                    type="email"
                                                    {...field}
                                                    disabled={isLoading}
                                                    className="bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:ring-2 focus:ring-white/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white flex items-center gap-2">
                                                <Lock className="text-neutral-400 w-4 h-4" /> Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="••••••••"
                                                    type="password"
                                                    {...field}
                                                    disabled={isLoading}
                                                    className="bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:ring-2 focus:ring-white/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white flex items-center gap-2">
                                                <Lock className="text-neutral-400 w-4 h-4" /> Confirm Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="••••••••"
                                                    type="password"
                                                    {...field}
                                                    disabled={isLoading}
                                                    className="bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:ring-2 focus:ring-white/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <motion.div
                                    whileHover={{ scale: isLoading ? 1 : 1.03 }}
                                    whileTap={{ scale: isLoading ? 1 : 0.97 }}
                                >
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-white text-black font-bold py-2 rounded-lg shadow hover:bg-neutral-200 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Registering...
                                            </>
                                        ) : (
                                            'Register'
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter>
                        <p className="text-sm text-neutral-400 w-full text-center">
                            Already have an account?{" "}
                            <Link href="/login" className="text-white underline hover:text-neutral-200 transition">
                                Login
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}