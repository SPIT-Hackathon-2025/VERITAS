"use client";
import { useEffect, useState } from "react";
import { auth,onAuthStateChanged } from "@/app/hooks/firebase";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser)); // Store user details
      } else {
        setUser(null);
        localStorage.removeItem("user"); // Remove user on logout
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return { user, loading };
};
