import Link from 'next/link'
import React from 'react'

export default function Navbar() {
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-zinc-700 px-4 py-4 bg-zinc-900/50">
      <div className="flex items-center gap-2">
        {/* Emerald-themed VS logo */}
        <div className="size-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_10px_#34d399] animate-pulse flex items-center justify-center">
          <span className="text-black font-bold text-sm">VS</span>
        </div>
        <h1 className="text-base font-bold md:text-2xl text-white">Versus</h1>
      </div>

      <Link href="/login">
        <button className="w-24 md:w-32 transform rounded-lg bg-zinc-800 px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 border border-emerald-500">
          Login
        </button>
      </Link>
    </nav>
  )
}
