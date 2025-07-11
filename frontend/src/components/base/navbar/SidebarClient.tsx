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
    <aside className="fixed left-0 top-0 h-full w-64 bg-black border-r border-zinc-800 flex flex-col py-8 z-40 shadow-2xl shadow-black/20">
      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center justify-center group">
        <motion.span
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-3xl font-black text-white tracking-wider"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          VERSUS
        </motion.span>
      </Link>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-2 flex-1 px-6">
        {isAuthenticated && (
          <>
            <SidebarItem href="/" icon={Home} title="Home" isActive />
            <SidebarItem href="/timeline" icon={TrendingUp} title="Timeline" />
            <SidebarItem href="/profile" icon={User} title="Profile" />
            <SidebarItem href="/bookmarks" icon={Bookmark} title="Bookmarks" />

            {/* Create Post Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6 mb-4">
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="group relative flex w-full items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white py-3 px-4 transition-all duration-500 hover:from-emerald-400 hover:to-emerald-500 active:scale-95"
              >
                <Plus size={20} strokeWidth={2.5} className="mr-2" />
                <span className="font-semibold">Create Post</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </motion.div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent my-4" />

            {/* Notifications */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button className="group relative flex w-full items-center justify-center rounded-xl bg-zinc-800/40 text-zinc-400 py-3 px-4 transition-all duration-300 hover:bg-emerald-500/15 hover:text-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10">
                <Bell size={18} strokeWidth={2} className="mr-3" />
                <span className="font-medium">Notifications</span>
                <div className="absolute top-3 right-4 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse border border-zinc-950 shadow-sm" />
              </button>
            </motion.div>

            {/* Settings */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button className="group relative flex w-full items-center justify-center rounded-xl bg-zinc-800/40 text-zinc-400 py-3 px-4 transition-all duration-300 hover:bg-emerald-500/15 hover:text-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10">
                <Settings size={18} strokeWidth={2} className="mr-3" />
                <span className="font-medium">Settings</span>
              </button>
            </motion.div>
          </>
        )}
      </nav>

      {/* Profile Section */}
      <div className="mt-auto flex flex-col items-center w-full px-6">
        {isAuthenticated ? (
          <div className="w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0">
                <ProfileDropdown user={(user || session?.user) as any} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-400">@{session?.user?.email?.split('@')[0] || 'user'}</p>
              </div>
            </div>
          </div>
        ) : (
          <Link href="/login" className="w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 font-semibold text-white transition-all duration-300 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-xl hover:shadow-emerald-500/30 relative overflow-hidden"
            >
              <LogIn size={16} strokeWidth={2.5} className="mr-2" />
              <span className="tracking-wide">Login</span>
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

interface SidebarItemProps {
  href: string
  icon: React.ElementType
  title: string
  isActive?: boolean
}

function SidebarItem({ href, icon: Icon, title, isActive }: SidebarItemProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
      <Link
        href={href}
        className={`group relative flex w-full items-center rounded-xl transition-all duration-300 py-3 px-4
          ${
            isActive
              ? "bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/15"
              : "bg-zinc-800/30 text-zinc-400 hover:bg-emerald-500/12 hover:text-emerald-400 hover:shadow-md hover:shadow-emerald-500/5"
          }`}
      >
        <Icon size={18} strokeWidth={2} className="mr-3" />
        <span className="font-medium">{title}</span>
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-400 rounded-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    </motion.div>
  )
}
