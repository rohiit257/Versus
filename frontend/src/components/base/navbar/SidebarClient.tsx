"use client"
import { motion } from "framer-motion"
import type React from "react"

import Link from "next/link"
import { Home, Plus, TrendingUp, Bell, User, LogIn, Settings, Bookmark, Menu, X, ChartLine, MessageCircle, FileQuestionMark } from "lucide-react"
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
      <aside className={`fixed left-0 top-0 h-full w-64 bg-background/98 backdrop-blur-xl border-r border-border/30 flex flex-col z-40 shadow-2xl shadow-black/10 dark:shadow-white/5 transform transition-transform duration-300 lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Profile Section at top */}
        {isAuthenticated && (
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border border-emerald-500/10 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex-shrink-0">
                <ProfileDropdown user={(user || session?.user) as any} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate font-medium">
                  @{session?.user?.email?.split('@')[0] || 'user'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {isAuthenticated && (
            <>
              <SidebarItem href="/" icon={Home} title="Home" isActive={isActive("/")} onClick={() => setIsMobileMenuOpen(false)} />
              <SidebarItem href="/timeline" icon={TrendingUp} title="Timeline" isActive={isActive("/timeline")} onClick={() => setIsMobileMenuOpen(false)} />
              <SidebarItem href="/profile" icon={User} title="Profile" isActive={isActive("/profile")} onClick={() => setIsMobileMenuOpen(false)} />
              <SidebarItem href="/bookmarks" icon={Bookmark} title="Bookmarks" isActive={isActive("/bookmarks")} onClick={() => setIsMobileMenuOpen(false)} />
              <SidebarItem href="/analysis" icon={ChartLine} title="Analysis" isActive={isActive("/analysis")} onClick={() => setIsMobileMenuOpen(false)} />
              <SidebarItem href="/Chat" icon={MessageCircle} title="Chat" isActive={isActive("/Chat")} onClick={() => setIsMobileMenuOpen(false)} />
              <SidebarItem href="/FAQ" icon={FileQuestionMark} title="FAQ" isActive={isActive("/FAQ")} onClick={() => setIsMobileMenuOpen(false)} />

              {/* Create Post Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-3 mb-2">
                <button
                  onClick={() => {
                    setIsCreateDialogOpen(true)
                    setIsMobileMenuOpen(false)
                  }}
                  className="group flex w-full items-center justify-center rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-2.5 px-4 font-semibold shadow-sm hover:shadow-md transition-all duration-300 border border-blue-500/20"
                >
                  <Plus size={16} strokeWidth={2} className="mr-2" />
                  <span>Create Post</span>
                </button>
              </motion.div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent my-2 mx-3" />
            </>
          )}
          {!isAuthenticated && (
            <Link href="/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2.5 font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 relative overflow-hidden"
              >
                <LogIn size={16} strokeWidth={2} className="mr-2" />
                <span>Login</span>
              </motion.button>
            </Link>
          )}
        </nav>

        {/* Theme Toggle at bottom */}
        <div className="px-4 pb-3">
          <div className="flex justify-center p-1.5 rounded-xl bg-muted/20 border border-border/20">
            <ThemeToggle />
          </div>
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
        className={`group relative flex w-full items-center rounded-2xl transition-all duration-300 py-2.5 px-4 font-medium text-sm
          ${
            isActive
              ? "bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20"
              : "text-foreground hover:bg-muted/40 hover:border-border/20 hover:shadow-sm"
          }`}
      >
        <Icon size={16} strokeWidth={2} className="mr-3" />
        <span className="font-medium text-sm">{title}</span>
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full shadow-sm"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    </motion.div>
  )
}
