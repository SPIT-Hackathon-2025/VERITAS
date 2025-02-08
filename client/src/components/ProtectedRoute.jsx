"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-center text-white">Loading...</div>; // Show a loading state
  }

  return user ? children : null;
};

export default ProtectedRoute;
