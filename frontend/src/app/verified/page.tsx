"use client"

import React from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

export default function CleanVerifiedLoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border border-border bg-card rounded-2xl">
          <CardHeader className="text-center space-y-2 pb-6 lg:pb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="bg-emerald-500/20 p-4 rounded-full">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-semibold text-foreground">You are verified</CardTitle>
            <CardDescription className="text-muted-foreground mt-2 text-sm lg:text-base">
              Your account has been successfully verified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="w-full text-base font-medium"
              size="lg"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}