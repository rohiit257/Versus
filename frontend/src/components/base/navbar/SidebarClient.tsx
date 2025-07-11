"use client"
import { motion } from "framer-motion"
import type React from "react"

import Link from "next/link"
import { Home, Plus, TrendingUp, Bell, User, LogIn, Settings, Bookmark } from "lucide-react"
import { useState } from "react"
import type { customUser } from "@/app/api/auth/[...nextauth]/options"
import CreatePostDialog from "./CreatePostDialog"
import ProfileDropdown from "./ProfileDropdown"
import { useSession } from "next-auth/react"

interface SidebarClientProps {
  user?: customUser
}

export default function SidebarClient({ user }: SidebarClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { data: session } = useSession()
  const isAuthenticated = user || session?.user

  return (
    <aside className="fixed left-0 top-0 h-full w-20 bg-gradient-to-b from-zinc-950/98 via-zinc-900/95 to-zinc-950/98 backdrop-blur-2xl border-r border-zinc-800/40 flex flex-col items-center py-8 z-40 shadow-2xl shadow-black/20">
      {/* Logo */}
      <Link href="/" className="mb-10 flex flex-col items-center group">
        <motion.div
          whileHover={{ scale: 1.08, rotate: 3 }}
          whileTap={{ scale: 0.92 }}
          className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-2xl shadow-emerald-500/30 group-hover:shadow-emerald-400/40 transition-all duration-500"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-lg font-black text-black tracking-tight"
          >
            VS
          </motion.span>
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(16, 185, 129, 0.2)",
                "0 0 35px rgba(16, 185, 129, 0.4)",
                "0 0 20px rgba(16, 185, 129, 0.2)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-2xl"
          />
        </motion.div>
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-[10px] font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent mt-2.5 tracking-wide"
        >
          Versus
        </motion.span>
      </Link>

      {/* Navigation Icons */}
      <nav className="flex flex-col gap-3 flex-1 items-center w-full px-3">
        {isAuthenticated && (
          <>
            <SidebarIcon href="/" icon={Home} tooltip="Home" isActive />
            <SidebarIcon href="/timeline" icon={TrendingUp} tooltip="Timeline" />
            <SidebarIcon href="/profile" icon={User} tooltip="Profile" />
            <SidebarIcon href="/bookmarks" icon={Bookmark} tooltip="Bookmarks" />

            {/* Create Post Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-6 mb-2">
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 transition-all duration-500 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-400/50 hover:shadow-2xl active:scale-95"
              >
                <Plus size={22} strokeWidth={2.5} />
                <Tooltip text="Create Post" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </motion.div>

            {/* Divider */}
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent my-2" />

            {/* Notifications */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/40 text-zinc-400 transition-all duration-300 hover:bg-emerald-500/15 hover:text-emerald-400 border border-zinc-700/40 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10">
                <Bell size={18} strokeWidth={2} />
                <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse border border-zinc-950 shadow-sm" />
                <Tooltip text="Notifications" />
              </button>
            </motion.div>

            {/* Settings */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/40 text-zinc-400 transition-all duration-300 hover:bg-emerald-500/15 hover:text-emerald-400 border border-zinc-700/40 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10">
                <Settings size={18} strokeWidth={2} />
                <Tooltip text="Settings" />
              </button>
            </motion.div>
          </>
        )}
      </nav>

      {/* Profile Section */}
      <div className="mt-auto flex flex-col items-center w-full px-3">
        {isAuthenticated ? (
          <ProfileDropdown user={(user || session?.user) as any} />
        ) : (
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-xl hover:shadow-emerald-500/30 border border-emerald-500/20 relative overflow-hidden"
            >
              <LogIn size={14} strokeWidth={2.5} />
              <span className="ml-1.5 tracking-wide">Login</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </Link>
        )}
      </div>

      {/* Create Post Dialog */}
      {isAuthenticated && <CreatePostDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />}
    </aside>
  )
}

interface SidebarIconProps {
  href: string
  icon: React.ElementType
  tooltip: string
  isActive?: boolean
}

function SidebarIcon({ href, icon: Icon, tooltip, isActive }: SidebarIconProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full flex justify-center">
      <Link
        href={href}
        className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 border backdrop-blur-sm
          ${
            isActive
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/15"
              : "bg-zinc-800/30 text-zinc-400 hover:bg-emerald-500/12 hover:text-emerald-400 border-zinc-700/40 hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5"
          }`}
      >
        <Icon size={18} strokeWidth={2} />
        <Tooltip text={tooltip} />
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute -left-1 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-emerald-400 rounded-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    </motion.div>
  )
}

function Tooltip({ text }: { text: string }) {
  return (
    <div className="absolute left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 group-hover:translate-x-1">
      <div className="bg-zinc-900/98 backdrop-blur-xl text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap shadow-2xl border border-zinc-700/50 relative">
        {text}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-zinc-900/98 border-l border-b border-zinc-700/50 transform rotate-45 backdrop-blur-xl"></div>
      </div>
    </div>
  )
}
