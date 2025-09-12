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
import { User, Mail, Lock, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react"
import Link from 'next/link'
import axios from 'axios'
import { toast } from "sonner"
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

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
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

        const {data:session} = useSession()
    
        const user = session?.user as {token?:string} | undefined
    
        if(user){
            redirect("/timeline")
        }

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
            
            const response = await axios.post("https://versus-server-latest.onrender.com/api/auth/v1/register", cleanedData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000, // 10 second timeout
            })
            
            if (response.status === 200 || response.status === 201) {
                setSubmitMessage({ type: 'success', message: 'Registration successful! Please check your email for verification' })
                toast("Registration successful Please check your email for verification")
                
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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <Card className="bg-card border border-border shadow-lg rounded-xl">
                    <CardHeader className="text-center space-y-2 pb-4 lg:pb-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="flex justify-center mb-3"
                        >
                            <CheckCircle2 className="text-emerald-500 text-3xl bg-emerald-100 dark:bg-emerald-900/20 rounded-full border-2 border-emerald-200 dark:border-emerald-800 p-1.5" />
                        </motion.div>
                        <CardTitle className="text-2xl font-bold text-foreground tracking-tight">Create Account</CardTitle>
                        <CardDescription className="text-muted-foreground mt-1 text-sm">Join Versus and start your journey</CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 lg:px-5">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {/* Display success/error message */}
                                {submitMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-2 rounded text-xs font-medium ${
                                            submitMessage.type === 'success' 
                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                                                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
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
                                            <FormLabel className="text-foreground flex items-center gap-2 text-sm lg:text-base">
                                                <User className="text-muted-foreground w-4 h-4" /> Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your Name"
                                                    {...field}
                                                    disabled={isLoading}
                                                    className="bg-input border border-border text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring transition disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base h-11 lg:h-12"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-xs lg:text-sm" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground flex items-center gap-2 text-sm lg:text-base">
                                                <Mail className="text-muted-foreground w-4 h-4" /> Email
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="you@example.com"
                                                    type="email"
                                                    {...field}
                                                    disabled={isLoading}
                                                    className="bg-input border border-border text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring transition disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base h-11 lg:h-12"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-xs lg:text-sm" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground flex items-center gap-2 text-sm lg:text-base">
                                                <Lock className="text-muted-foreground w-4 h-4" /> Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="••••••••"
                                                        type={showPassword ? "text" : "password"}
                                                        {...field}
                                                        disabled={isLoading}
                                                        className="pl-10 pr-10 bg-input border border-border text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring transition disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base h-11 lg:h-12"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-11 lg:h-12 px-3 hover:bg-transparent"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        disabled={isLoading}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-xs lg:text-sm" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground flex items-center gap-2 text-sm lg:text-base">
                                                <Lock className="text-muted-foreground w-4 h-4" /> Confirm Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="••••••••"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        {...field}
                                                        disabled={isLoading}
                                                        className="pl-10 pr-10 bg-input border border-border text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring transition disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base h-11 lg:h-12"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-11 lg:h-12 px-3 hover:bg-transparent"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        disabled={isLoading}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-xs lg:text-sm" />
                                        </FormItem>
                                    )}
                                />

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="pt-2"
                                >
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full h-11 lg:h-12 bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-600 transition disabled:opacity-50 text-sm lg:text-base"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Creating account...
                                            </div>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>
                        
                        <div className="text-center pt-4">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="text-emerald-500 hover:text-emerald-400 underline font-medium"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}