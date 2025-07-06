"use client"

import React from 'react'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CleanVerifiedLoginPage() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-md">
        
        {/* Verified Icon */}
        <div className="flex justify-center">
          <div className="bg-white/10 p-4 rounded-full">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            You are verified
          </h1>
          <p className="text-zinc-400 text-sm">
            Your account has been successfully verified
          </p>
        </div>

        {/* Login Button */}
        <Button 
          onClick={() => window.location.href = '/login'}
          className="w-full bg-black text-white hover:bg-zinc-800 py-3 text-base font-medium"
        >
          Login
        </Button>

      </div>
    </div>
  )
}