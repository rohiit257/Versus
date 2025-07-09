"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Plus, TrendingUp, Bell, User, LogIn } from "lucide-react";
import { useState } from "react";

import { customUser } from "@/app/api/auth/[...nextauth]/options";
import CreatePostDialog from "./CreatePostDialog";
import ProfileDropdown from "./ProfileDropdown";
import { useSession } from "next-auth/react";

interface NavbarClientProps {
  user?: customUser;
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: session } = useSession();

  // Check if user is authenticated (either through prop or session)
  const isAuthenticated = user || session?.user;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative z-50 w-full border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-lg"
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-lg font-black text-black"
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
                className="absolute inset-0 rounded-xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex items-center"
            >
              <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                Versus
              </span>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="ml-1 text-emerald-400"
              >
                ⚡
              </motion.div>
            </motion.div>
          </Link>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-6">
            {/* Only show navigation icons if user is authenticated */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-6">
                <NavIcon href="/" icon={Home} tooltip="Home" isActive />
                <NavIcon href="/timeline" icon={TrendingUp} tooltip="Timeline" />
                
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
              </div>
            )}

            {/* Profile Dropdown or Login Button */}
            {isAuthenticated ? (
              <ProfileDropdown user={user || session?.user} />
            ) : (
              <div className="flex items-center space-x-3">
                {/* Desktop Login Button */}
                <Link href="/login" className="hidden md:block">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25"
                  >
                    <LogIn size={16} />
                    <span>Login</span>
                  </motion.button>
                </Link>

                {/* Mobile Login Button */}
                <Link href="/login" className="md:hidden">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white transition-all duration-300 hover:bg-emerald-500"
                  >
                    <LogIn size={20} />
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Dialog - Only show if user is authenticated */}
      {isAuthenticated && (
        <CreatePostDialog 
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          user={user || session?.user}
        />
      )}
    </motion.nav>
  );
}

// Helper Components
interface NavIconProps {
  href: string;
  icon: React.ElementType;
  tooltip: string;
  isActive?: boolean;
}

function NavIcon({ href, icon: Icon, tooltip, isActive }: NavIconProps) {
  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Link
        href={href}
        className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 ${
          isActive 
            ? "bg-zinc-800/50 text-emerald-400" 
            : "bg-zinc-800/50 text-white hover:bg-emerald-500/20 hover:text-emerald-400"
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
    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <div className="bg-zinc-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {text}
      </div>
    </div>
  );
}