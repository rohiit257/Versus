"use client"
import React, { use } from 'react'
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

// Zod schema with validation for name, email, password, confirm password
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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const onSubmit = (data: any) => {
        console.log(data)
        // Handle registration logic here
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900">
            <Card className="w-full max-w-md shadow-lg border-0 bg-zinc-800">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-emerald-400">Register</CardTitle>
                    <CardDescription className="text-zinc-300">Create your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-200">Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Your Name"
                                                {...field}
                                                className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder-zinc-400 focus:ring-emerald-400"
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
                                        <FormLabel className="text-zinc-200">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="you@example.com"
                                                type="email"
                                                {...field}
                                                className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder-zinc-400 focus:ring-emerald-400"
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
                                        <FormLabel className="text-zinc-200">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="••••••••"
                                                type="password"
                                                {...field}
                                                className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder-zinc-400 focus:ring-emerald-400"
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
                                        <FormLabel className="text-zinc-200">Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="••••••••"
                                                type="password"
                                                {...field}
                                                className="bg-zinc-700 border-zinc-600 text-zinc-100 placeholder-zinc-400 focus:ring-emerald-400"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                                Register
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-zinc-400 w-full text-center">
                        Already have an account?{" "}
                        <a href="/login" className="text-emerald-400 hover:underline">
                            Login
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
