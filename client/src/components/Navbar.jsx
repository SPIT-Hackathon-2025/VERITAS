"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Terminal } from "lucide-react";
import { auth } from "@/app/hooks/firebase";
import { useAuth } from "@/app/hooks/useAuth";


export function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/auth/login"); // Redirect to login page
  };

  return (
    <nav className="w-full py-4 bg-gray-900/80 backdrop-blur-sm fixed top-0 z-50 border-b border-gray-800">
      <div className="container px-4 mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold text-white">MindLink</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/features" className="text-gray-300 hover:text-white">Features</Link>
          <Link href="/feedback" className="text-gray-300 hover:text-white">Feedback</Link>

          {loading ? null : user ? (
            <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
              Logout
            </Button>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-blue-500 hover:bg-blue-600">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        <Button variant="ghost" className="md:hidden text-gray-300">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </nav>
  );
}
