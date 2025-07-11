"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Plus, TrendingUp, Bell, User, LogIn } from "lucide-react";
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
    <aside className="fixed left-0 top-0 h-full w-20 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-6 z-40">
      {/* Logo */}
      <Link href="/" className="mb-8 flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-lg"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-xl font-black text-black"
          >
            VS
          </motion.span>
        </motion.div>
        <span className="text-xs font-black bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent mt-1">Versus</span>
      </Link>

      {/* Navigation Icons */}
      <nav className="flex flex-col gap-6 flex-1 items-center w-full">
        {isAuthenticated && (
          <>
            <SidebarIcon href="/" icon={Home} tooltip="Home" isActive />
            <SidebarIcon href="/timeline" icon={TrendingUp} tooltip="Timeline" />
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="group relative flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50 text-white transition-all duration-300 hover:bg-emerald-500/20 hover:text-emerald-400"
              >
                <Plus size={20} />
                <Tooltip text="Create" />
              </button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <button className="group relative flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50 text-white transition-all duration-300 hover:bg-emerald-500/20 hover:text-emerald-400">
                <Bell size={20} />
                <div className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                <Tooltip text="Notifications" />
              </button>
            </motion.div>
          </>
        )}
      </nav>

      {/* Profile Dropdown or Login Button */}
      <div className="mt-auto mb-4 flex flex-col items-center w-full">
        {isAuthenticated ? (
          <ProfileDropdown user={(user || session?.user) as any} />
        ) : (
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25"
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
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Link
        href={href}
        className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 mb-2
          ${isActive ? "bg-zinc-800/50 text-emerald-400" : "bg-zinc-800/50 text-white hover:bg-emerald-500/20 hover:text-emerald-400"}`}
      >
        <Icon size={20} />
        <Tooltip text={tooltip} />
      </Link>
    </motion.div>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <div className="absolute left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className="bg-zinc-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
        {text}
      </div>
    </div>
  );
} 