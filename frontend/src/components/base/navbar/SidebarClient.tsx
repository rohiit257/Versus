"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Plus, TrendingUp, Bell, User, LogIn, Settings, Bookmark } from "lucide-react";
import { useState } from "react";
import { customUser } from "@/app/api/auth/[...nextauth]/options";
import CreatePostDialog from "./CreatePostDialog";
import ProfileDropdown from "./ProfileDropdown";
import { useSession } from "next-auth/react";

interface SidebarClientProps {
  user?: customUser;
}

export default function SidebarClient({ user }: SidebarClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: session } = useSession();
  const isAuthenticated = user || session?.user;

  return (
    <aside className="fixed left-0 top-0 h-full w-20 bg-gradient-to-b from-zinc-950/95 via-zinc-900/90 to-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/50 flex flex-col items-center py-6 z-40 shadow-2xl">
      {/* Logo */}
      <Link href="/" className="mb-8 flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-xl shadow-emerald-500/25"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-xl font-black text-black"
          >
            VS
          </motion.span>
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(16, 185, 129, 0.3)",
                "0 0 30px rgba(16, 185, 129, 0.5)",
                "0 0 20px rgba(16, 185, 129, 0.3)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-2xl"
          />
        </motion.div>
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="text-xs font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent mt-2"
        >
          Versus
        </motion.span>
      </Link>

      {/* Navigation Icons */}
      <nav className="flex flex-col gap-4 flex-1 items-center w-full px-2">
        {isAuthenticated && (
          <>
            <SidebarIcon href="/" icon={Home} tooltip="Home" isActive />
            <SidebarIcon href="/timeline" icon={TrendingUp} tooltip="Timeline" />
            <SidebarIcon href="/profile" icon={User} tooltip="Profile" />
            <SidebarIcon href="/bookmarks" icon={Bookmark} tooltip="Bookmarks" />
            
            {/* Create Post Button */}
            <motion.div 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.95 }}
              className="mt-4"
            >
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-400/40 hover:scale-105"
              >
                <Plus size={24} />
                <Tooltip text="Create Post" />
              </button>
            </motion.div>

            {/* Notifications */}
            <motion.div 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.95 }}
              className="mt-4"
            >
              <button className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/50 text-white transition-all duration-300 hover:bg-emerald-500/20 hover:text-emerald-400 border border-zinc-700/50 hover:border-emerald-500/30">
                <Bell size={20} />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse border-2 border-zinc-950" />
                <Tooltip text="Notifications" />
              </button>
            </motion.div>

            {/* Settings */}
            <motion.div 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.95 }}
              className="mt-4"
            >
              <button className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/50 text-white transition-all duration-300 hover:bg-emerald-500/20 hover:text-emerald-400 border border-zinc-700/50 hover:border-emerald-500/30">
                <Settings size={20} />
                <Tooltip text="Settings" />
              </button>
            </motion.div>
          </>
        )}
      </nav>

      {/* Profile Section */}
      <div className="mt-auto mb-4 flex flex-col items-center w-full px-2">
        {isAuthenticated ? (
          <ProfileDropdown user={(user || session?.user) as any} />
        ) : (
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25 border border-emerald-500/20"
            >
              <LogIn size={16} />
              <span className="ml-2">Login</span>
            </motion.button>
          </Link>
        )}
      </div>

      {/* Create Post Dialog */}
      {isAuthenticated && (
        <CreatePostDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
        />
      )}
    </aside>
  );
}

interface SidebarIconProps {
  href: string;
  icon: React.ElementType;
  tooltip: string;
  isActive?: boolean;
}

function SidebarIcon({ href, icon: Icon, tooltip, isActive }: SidebarIconProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.1 }} 
      whileTap={{ scale: 0.95 }}
      className="w-full flex justify-center"
    >
      <Link
        href={href}
        className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 border
          ${isActive 
            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10" 
            : "bg-zinc-800/30 text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 border-zinc-700/50 hover:border-emerald-500/30"
          }`}
      >
        <Icon size={20} />
        <Tooltip text={tooltip} />
      </Link>
    </motion.div>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
      <div className="bg-zinc-900/95 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl border border-zinc-700/50">
        {text}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-zinc-900/95 border-l border-b border-zinc-700/50 transform rotate-45"></div>
      </div>
    </div>
  );
} 