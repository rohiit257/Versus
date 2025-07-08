"use client"

import React from 'react'
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
import { Mail, KeyRound, ArrowLeft } from 'lucide-react'
import { motion } from "framer-motion"
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { toast } from "sonner" // or your preferred toast library
import axios from 'axios'

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
})

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSubmitted, setIsSubmitted] = React.useState(false)
    const router = useRouter()
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        
        try {
            console.log('🚀 Starting password reset process...')
            console.log('📧 Reset data:', { email: data.email })
            
            // Replace this with your actual password reset API call
            const response = await axios.post('http://localhost:8000/api/auth/v1/forget-password', {
                email: data.email,
            })

            console.log('🔍 Reset response:', response)
            console.log('✅ Response data:', response.data)

            // Check if the response indicates success (status 200 in response body)
            if (response.data.status === 200) {
                console.log('✅ Password reset email sent successfully!')
                setIsSubmitted(true)
                toast.success(response.data.message || "Password reset email sent! Check your inbox.")
            } else {
                // Handle API errors that return with 200 HTTP status but error status in body
                console.error('❌ Password reset failed:', response.data.message)
                toast.error(response.data.message || "Failed to send reset email")
            }
        } catch (error) {
            console.error("💥 Password reset error:", error)
            
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || error.message
                console.error('❌ Password reset failed:', errorMessage)
                toast.error(errorMessage || "Failed to send reset email")
            } else {
                toast.error("An error occurred while sending reset email")
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    <Card className="w-full shadow-2xl border border-neutral-800 bg-neutral-900/95 rounded-2xl">
                        <CardHeader className="text-center space-y-2 pb-8">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="mx-auto w-12 h-12 bg-green-600 border-2 border-green-400 rounded-xl flex items-center justify-center mb-4"
                            >
                                <Mail className="w-6 h-6 text-white" />
                            </motion.div>
                            <CardTitle className="text-2xl font-semibold text-white">Check your email</CardTitle>
                            <CardDescription className="text-neutral-400">
                                We've sent a password reset link to your email address
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center space-y-4">
                                <p className="text-sm text-neutral-400">
                                    Didn't receive the email? Check your spam folder or{" "}
                                    <Button
                                        variant="link"
                                        className="text-yellow-400 hover:text-yellow-300 p-0 h-auto font-normal underline"
                                        onClick={() => {
                                            setIsSubmitted(false)
                                            form.reset()
                                        }}
                                    >
                                        try again
                                    </Button>
                                </p>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 underline"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to login
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <Card className="w-full shadow-2xl border border-neutral-800 bg-neutral-900/95 rounded-2xl">
                    <CardHeader className="text-center space-y-2 pb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mx-auto w-12 h-12 bg-black border-2 border-white rounded-xl flex items-center justify-center mb-4"
                        >
                            <KeyRound className="w-6 h-6 text-white" />
                        </motion.div>
                        <CardTitle className="text-2xl font-semibold text-white">Forgot password?</CardTitle>
                        <CardDescription className="text-neutral-400">
                            Enter your email address and we'll send you a link to reset your password
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white font-medium flex items-center gap-2">
                                                <Mail className="text-neutral-400 w-4 h-4" /> Email
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                                                    <Input
                                                        placeholder="Enter your email"
                                                        type="email"
                                                        {...field}
                                                        disabled={isLoading}
                                                        className="pl-10 h-12 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:ring-2 focus:ring-white/40 transition disabled:opacity-50"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-yellow-400" />
                                        </FormItem>
                                    )}
                                />

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="pt-2"
                                >
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full h-12 bg-white text-black font-bold shadow hover:bg-neutral-200 transition disabled:opacity-50"
                                    >
                                        {isLoading ? "Sending..." : "Send Reset Link"}
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>
                        
                        <div className="text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 underline"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}