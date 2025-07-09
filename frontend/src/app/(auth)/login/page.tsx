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
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { motion } from "framer-motion"
import Link from 'next/link'
import { signIn, useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { toast } from "sonner" // or your preferred toast library

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
})

export default function Login() {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const router = useRouter()

    const {data:session} = useSession()

    const user = session?.user as {token?:string} | undefined

    if(user){
        redirect("/timeline")
    }
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true)
        
        try {
            console.log('🚀 Starting login process...')
            console.log('📧 Login data:', { email: data.email, password: '***' })
            
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            })

            console.log('🔍 SignIn result:', result)
            console.log('✅ Result OK:', result?.ok)
            console.log('❌ Result Error:', result?.error)
            console.log('🔗 Result URL:', result?.url)
            console.log('📊 Result Status:', result?.status)

            if (result?.error) {
                console.error('❌ Authentication failed:', result.error)
                toast.error(`Authentication failed: ${result.error}`)
            } else if (result?.ok) {
                console.log('✅ Authentication successful!')
                toast.success("Successfully signed in!")
                router.push("/")
            } else {
                console.error('❓ Unexpected result:', result)
                toast.error("Something went wrong during login")
            }
        } catch (error) {
            console.error("💥 Login error:", error)
            toast.error("An error occurred during login")
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
                <Card className="w-full shadow-2xl border border-neutral-800 bg-neutral-900/95 rounded-2xl">
                    <CardHeader className="text-center space-y-2 pb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mx-auto w-12 h-12 bg-black border-2 border-white rounded-xl flex items-center justify-center mb-4"
                        >
                            <Lock className="w-6 h-6 text-white" />
                        </motion.div>
                        <CardTitle className="text-2xl font-semibold text-white">Welcome back</CardTitle>
                        <CardDescription className="text-neutral-400">Sign in to your account to continue</CardDescription>
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
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white font-medium flex items-center gap-2">
                                                <Lock className="text-neutral-400 w-4 h-4" /> Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                                                    <Input
                                                        placeholder="Enter your password"
                                                        type={showPassword ? "text" : "password"}
                                                        {...field}
                                                        disabled={isLoading}
                                                        className="pl-10 pr-10 h-12 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:ring-2 focus:ring-white/40 transition disabled:opacity-50"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        disabled={isLoading}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4 text-neutral-500" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-neutral-500" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-yellow-400" />
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="flex items-center justify-between pt-2">
                                    <p className='text-sm text-neutral-400'>
                                        <Link
                                    href="/forget-password"
                                    className="text-yellow-400 hover:text-yellow-300 underline"
                                >
                                    Forget Password?
                                </Link>
                                    </p>
                                     
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full h-12 bg-white text-black font-bold shadow hover:bg-neutral-200 transition disabled:opacity-50"
                                    >
                                        {isLoading ? "Signing in..." : "Sign In"}
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>
                        
                        <div className="text-center">
                            <p className="text-sm text-neutral-400">
                                Don't have an account?{" "}
                                <Link
                                    href="/register"
                                    className="text-yellow-400 hover:text-yellow-300 underline"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}