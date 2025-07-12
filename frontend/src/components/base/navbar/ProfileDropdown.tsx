"use client";

import { motion } from "framer-motion";
import { UserCircle, Settings, Bell, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { customUser } from "@/app/api/auth/[...nextauth]/options";

interface ProfileDropdownProps {
  user: customUser;
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const logoutUser = () => {
    signOut({
      callbackUrl: "/login",
      redirect: true
    });
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(user.name || "User");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-background"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <span className="text-sm font-bold text-black">{initials}</span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 bg-popover border-border text-popover-foreground"
        align="end"
        sideOffset={5}
      >
        <DropdownMenuLabel className="text-emerald-400">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <span className="text-sm font-bold text-black">{initials}</span>
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">@{user.email|| "user"}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem className="focus:bg-muted focus:text-foreground cursor-pointer">
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="focus:bg-muted focus:text-foreground cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="focus:bg-muted focus:text-foreground cursor-pointer">
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem 
          className="focus:bg-red-900 focus:text-red-100 cursor-pointer text-red-400" 
          onClick={logoutUser}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}