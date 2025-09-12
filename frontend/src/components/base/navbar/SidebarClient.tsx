"use client"
import { motion } from "framer-motion"
import type React from "react"

import Link from "next/link"
import {
  Home,
  Plus,
  TrendingUp,
  User,
  LogIn,
  Bookmark,
  Menu,
  X,
  Baseline as ChartLine,
  MessageCircle,
  FileQuestion as FileQuestionMark,
} from "lucide-react"
import { useState } from "react"
import type { customUser } from "@/app/api/auth/[...nextauth]/options"
import CreatePostDialog from "./CreatePostDialog"
import ProfileDropdown from "./ProfileDropdown"
import { useSession } from "next-auth/react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { usePathname } from "next/navigation"

interface SidebarClientProps {
  user?: customUser
}

export default function SidebarClient({ user }: SidebarClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAuthenticated = user || session?.user

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <button
        onClick={toggleMobileMenu}
        className="fixed top-6 left-6 z-50 p-3 rounded-xl bg-white/95 dark:bg-background border border-gray-200/60 dark:border-border shadow-lg backdrop-blur-sm lg:hidden transition-all duration-200 hover:shadow-xl"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={toggleMobileMenu} />}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white/98 dark:bg-background backdrop-blur-xl border-r border-gray-200/60 dark:border-border flex flex-col z-40 transition-transform duration-300 shadow-xl
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {isAuthenticated && (
          <div className="p-6 border-b border-gray-200/60 dark:border-border">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/80 dark:bg-muted backdrop-blur-sm">
              <ProfileDropdown user={(user || session?.user) as any} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-foreground truncate leading-tight">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground truncate font-medium mt-1">
                  @{session?.user?.email?.split("@")[0] || "user"}
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex flex-col px-4 py-6 flex-1 gap-2">
          {isAuthenticated && (
            <>
              <div className="space-y-1">
                <SidebarItem
                  href="/"
                  icon={Home}
                  title="Home"
                  isActive={isActive("/")}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <SidebarItem
                  href="/timeline"
                  icon={TrendingUp}
                  title="Timeline"
                  isActive={isActive("/timeline")}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <SidebarItem
                  href="/profile"
                  icon={User}
                  title="Profile"
                  isActive={isActive("/profile")}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <SidebarItem
                  href="/bookmarks"
                  icon={Bookmark}
                  title="Bookmarks"
                  isActive={isActive("/bookmarks")}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              </div>

              <div className="py-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsCreateDialogOpen(true)
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex w-full items-center justify-center rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-4 px-6 font-semibold transition-all duration-200 gap-3"
                >
                  <Plus size={18} />
                  <span>Create Post</span>
                </motion.button>
              </div>

              <div className="w-full h-px bg-gray-200/60 dark:bg-border my-4" />

              <div className="space-y-1 ">
                <SidebarItem
                  href="/analysis"
                  icon={ChartLine}
                  title="Analysis"
                  isActive={isActive("/analysis")}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <SidebarItem
                  href="/Chat"
                  icon={MessageCircle}
                  title="Chat"
                  isActive={isActive("/Chat")}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <SidebarItem
                  href="/FAQ"
                  icon={FileQuestionMark}
                  title="FAQ"
                  isActive={isActive("/FAQ")}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </>
          )}
          {!isAuthenticated && (
            <div className="px-2">
              <Link href="/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center rounded-2xl bg-green-500 hover:bg-green-600 text-white py-4 px-6 font-semibold transition-all duration-200 gap-3 shadow-lg"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </motion.button>
              </Link>
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-gray-200/60 dark:border-border mt-auto">
          <div className="flex justify-center p-3 rounded-2xl bg-gray-50/80 dark:bg-muted backdrop-blur-sm">
            <ThemeToggle />
          </div>
        </div>

        {/* Create Post Dialog */}
        {isAuthenticated && (
          <CreatePostDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
        )}
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
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="relative">
      <Link
        href={href}
        onClick={onClick}
        className={`group flex w-full items-center rounded-xl transition-all duration-200 py-3 px-4 text-sm font-medium gap-4 relative
          ${
            isActive
              ? "bg-gray-100/80 dark:bg-muted text-gray-900 dark:text-foreground shadow-sm"
              : "text-gray-600 dark:text-muted-foreground hover:bg-gray-50/80 dark:hover:bg-muted/50 hover:text-gray-900 dark:hover:text-foreground"
          }`}
      >
        <Icon size={18} className="flex-shrink-0" />
        <span className="leading-tight">{title}</span>
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full shadow-sm"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </Link>
    </motion.div>
  )
}
