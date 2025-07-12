"use client"
import { motion } from "framer-motion"
import type React from "react"

import Link from "next/link"
import { Home, Plus, TrendingUp, Bell, User, LogIn, Settings, Bookmark, Menu, X } from "lucide-react"
import { useState } from "react"
import type { customUser } from "@/app/api/auth/[...nextauth]/options"
import CreatePostDialog from "./CreatePostDialog"
import ProfileDropdown from "./ProfileDropdown"
import { useSession } from "next-auth/react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface SidebarClientProps {
  user?: customUser
}

export default function SidebarClient({ user }: SidebarClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session } = useSession()
  const isAuthenticated = user || session?.user

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-background border border-border shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-background border-r border-border flex flex-col py-8 z-40 shadow-2xl shadow-black/20 dark:shadow-white/5 transform transition-transform duration-300 lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Logo */}
        <Link href="/" className="mb-10 flex items-center justify-center group" onClick={() => setIsMobileMenuOpen(false)}>
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="relative text-center px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <span className="text-2xl font-bold text-foreground tracking-wider block">V/S</span>
            <span className="text-xs text-emerald-400 mt-1 block">Vote & Share</span>
          </motion.div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 flex-1 px-6">
          {isAuthenticated && (
            <>
              <SidebarItem href="/" icon={Home} title="Home" isActive onClick={() => setIsMobileMenuOpen(false)} />
              <SidebarItem href="/timeline" icon={TrendingUp} title="Timeline" onClick={() => setIsMobileMenuOpen(false)} />
              <SidebarItem href="/profile" icon={User} title="Profile" onClick={() => setIsMobileMenuOpen(false)} />
              <SidebarItem href="/bookmarks" icon={Bookmark} title="Bookmarks" onClick={() => setIsMobileMenuOpen(false)} />

              {/* Create Post Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4 mb-3">
                <button
                  onClick={() => {
                    setIsCreateDialogOpen(true)
                    setIsMobileMenuOpen(false)
                  }}
                  className="group relative flex w-full items-center justify-center rounded-xl bg-muted/30 text-foreground py-3 px-4 transition-all duration-300 hover:bg-muted/50 active:scale-95"
                >
                  <Plus size={20} strokeWidth={2.5} className="mr-2" />
                  <span className="font-semibold">Create Post</span>
                </button>
              </motion.div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-3" />

              {/* Notifications */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button className="group relative flex w-full items-center justify-center rounded-xl text-foreground py-3 px-4 transition-all duration-300 hover:bg-muted/30">
                  <Bell size={18} strokeWidth={2} className="mr-3" />
                  <span className="font-medium">Notifications</span>
                  <div className="absolute top-3 right-4 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse border border-background shadow-sm" />
                </button>
              </motion.div>

              {/* Settings */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button className="group relative flex w-full items-center justify-center rounded-xl text-foreground py-3 px-4 transition-all duration-300 hover:bg-muted/30">
                  <Settings size={18} strokeWidth={2} className="mr-3" />
                  <span className="font-medium">Settings</span>
                </button>
              </motion.div>

              {/* Theme Toggle */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-1">
                <div className="flex w-full items-center justify-center rounded-xl py-3 px-4">
                  <ThemeToggle />
                </div>
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
                  <p className="text-sm text-muted-foreground">@{session?.user?.email?.split('@')[0] || 'user'}</p>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex w-full items-center justify-center rounded-xl bg-muted/30 text-foreground px-4 py-3 font-semibold transition-all duration-300 hover:bg-muted/50 relative overflow-hidden"
              >
                <LogIn size={16} strokeWidth={2.5} className="mr-2" />
                <span className="tracking-wide">Login</span>
              </motion.button>
            </Link>
          )}
        </div>

        {/* Create Post Dialog */}
        {isAuthenticated && <CreatePostDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />}
      </aside>
    </>
  )
}

interface SidebarItemProps {
  href: string
  icon: React.ElementType
  title: string
  isActive?: boolean
  onClick?: () => void
}

function SidebarItem({ href, icon: Icon, title, isActive, onClick }: SidebarItemProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
      <Link
        href={href}
        onClick={onClick}
        className={`group relative flex w-full items-center rounded-xl transition-all duration-300 py-3 px-4
          ${
            isActive
              ? "bg-muted/50 text-foreground"
              : "text-foreground hover:bg-muted/30"
          }`}
      >
        <Icon size={18} strokeWidth={2} className="mr-3" />
        <span className="font-medium">{title}</span>
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-foreground rounded-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    </motion.div>
  )
}
