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
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'
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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <Card className="w-full shadow-2xl border border-border bg-card rounded-2xl">
                    <CardHeader className="text-center space-y-2 pb-6 lg:pb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mx-auto w-12 h-12 bg-emerald-500 border-2 border-emerald-400 rounded-xl flex items-center justify-center mb-4"
                        >
                            <Lock className="w-6 h-6 text-white" />
                        </motion.div>
                        <CardTitle className="text-xl lg:text-2xl font-semibold text-foreground">Welcome back</CardTitle>
                        <CardDescription className="text-muted-foreground text-sm lg:text-base">Sign in to your account to continue</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 lg:space-y-6 px-4 lg:px-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground font-medium flex items-center gap-2 text-sm lg:text-base">
                                                <Mail className="text-muted-foreground w-4 h-4" /> Email
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Enter your email"
                                                        type="email"
                                                        {...field}
                                                        disabled={isLoading}
                                                        className="pl-10 h-11 lg:h-12 bg-input border border-border text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring transition disabled:opacity-50 text-sm lg:text-base"
                                                    />
                                                </div>
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
                                            <FormLabel className="text-foreground font-medium flex items-center gap-2 text-sm lg:text-base">
                                                <Lock className="text-muted-foreground w-4 h-4" /> Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Enter your password"
                                                        type={showPassword ? "text" : "password"}
                                                        {...field}
                                                        disabled={isLoading}
                                                        className="pl-10 pr-10 h-11 lg:h-12 bg-input border border-border text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring transition disabled:opacity-50 text-sm lg:text-base"
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
                                
                                <div className="flex items-center justify-between pt-2">
                                    <Link
                                        href="/forget-password"
                                        className="text-sm text-emerald-500 hover:text-emerald-400 underline"
                                    >
                                        Forget Password?
                                    </Link>
                                </div>

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
                                        {isLoading ? "Signing in..." : "Sign In"}
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>
                        
                        <div className="text-center pt-4">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <Link
                                    href="/register"
                                    className="text-emerald-500 hover:text-emerald-400 underline font-medium"
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