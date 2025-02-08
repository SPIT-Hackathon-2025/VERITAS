"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, LogOut, User, HelpCircle, Terminal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [notifications] = useState([
    { id: 1, text: "New repository invitation", unread: true },
    { id: 2, text: "Security alert in mindlink-core", unread: true },
  ]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <nav className="w-full h-16 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 fixed top-0 z-50">
      <div className="h-full px-4 mx-auto max-w-[98%] flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Terminal className="h-6 w-6 text-blue-500" />
          <span className="font-bold text-xl text-white">MindLink</span>
        </div>

        {!loading && user && (
          <div className="flex items-center space-x-4 relative">
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-gray-400" />
                  {notifications.some((n) => n.unread) && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-blue-500 text-white text-xs">
                      {notifications.filter((n) => n.unread).length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-72 bg-gray-900 border border-gray-800"
                align="end"
                sideOffset={5}
              >
                <DropdownMenuLabel className="text-gray-400 p-3">
                  Notifications
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="py-3 px-3 cursor-pointer hover:bg-gray-800">
                      <div className="flex items-start space-x-2">
                        {notification.unread && (
                          <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-300">{notification.text}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || "/placeholder-avatar.jpg"} alt="user avatar" />
                    <AvatarFallback className="bg-gray-800 text-gray-400">
                      {user.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-gray-900 border border-gray-800"
                align="end"
                sideOffset={5}
              >
                <DropdownMenuLabel className="text-gray-400 p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-200">{user.displayName || "User"}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem className="py-2 px-3 cursor-pointer hover:bg-gray-800">
                  <User className="mr-2 h-4 w-4" />
                  <span className="text-gray-300">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2 px-3 cursor-pointer hover:bg-gray-800">
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="text-gray-300">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2 px-3 cursor-pointer hover:bg-gray-800">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span className="text-gray-300">Help</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem 
                  className="py-2 px-3 cursor-pointer hover:bg-gray-800/50 text-red-400" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {!loading && !user && (
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-blue-500 hover:bg-blue-600">Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export { Navbar };