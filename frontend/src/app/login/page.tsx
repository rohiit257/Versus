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
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
})

export default function Login() {
    const [showPassword, setShowPassword] = React.useState(false)
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        console.log(data)
        // Handle form submission logic here
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center space-y-2 pb-8">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-semibold text-slate-800">Welcome back</CardTitle>
                    <CardDescription className="text-slate-500">Sign in to your account to continue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-medium">Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="Enter your email"
                                                    type="email"
                                                    {...field}
                                                    className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-violet-300 focus:ring-violet-200 transition-all duration-200"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-medium">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                <Input
                                                    placeholder="Enter your password"
                                                    type={showPassword ? "text" : "password"}
                                                    {...field}
                                                    className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-violet-300 focus:ring-violet-200 transition-all duration-200"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-slate-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-slate-400" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />
                            
                            <div className="flex items-center justify-between pt-2">
                                <Button
                                    type="button"
                                    variant="link"
                                    className="text-sm text-violet-600 hover:text-violet-700 p-0 h-auto font-normal"
                                >
                                    Forgot password?
                                </Button>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                Sign In
                            </Button>
                        </form>
                    </Form>
                    
                    <div className="text-center">
                        <p className="text-sm text-slate-500">
                            Don't have an account?{" "}
                            <Button
                                variant="link"
                                className="text-violet-600 hover:text-violet-700 p-0 h-auto font-medium"
                            >
                                Sign up
                            </Button>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
