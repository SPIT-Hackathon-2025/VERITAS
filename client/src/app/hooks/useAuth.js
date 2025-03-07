"use client";
import { useEffect, useState } from "react";
import { auth, onAuthStateChanged, signOut } from "@/app/hooks/firebase";
import useAuthUserStore from "../context/authUserStore";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const {authUser,setAuthUser} = useAuthUserStore();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userData = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        };
        setUser(userData);
        setAuthUser(userData);
        localStorage.setItem("user", JSON.stringify(userData)); // Store minimal data
      } else {
        setUser(null);
        localStorage.removeItem("user"); // Remove on logout
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem("user");
  };

  return { user, loading, logout };
};
