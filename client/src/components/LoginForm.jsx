"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/hooks/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const username = user.displayName
          ? user.displayName.replace(/\s+/g, "")
          : "user";
        localStorage.setItem(
          "user",
          JSON.stringify({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
          })
        );
        router.push(`/${username}/repositories`);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const username = user.displayName ? user.displayName.replace(/\s+/g, "") : "user";

      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
        })
      );
      router.push(`/${username}/repositories`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
  setLoading(true);
  setError("");

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const isNewUser = result._tokenResponse?.isNewUser; // Check if the user is new
    const username = user.displayName ? user.displayName.replace(/\s+/g, "") : "user";

    // Store user data locally
    localStorage.setItem(
      "user",
      JSON.stringify({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      })
    );

    // If new user, send data to backend
    if (isNewUser) {
      console.log(user.uid)
      await fetch(`${BACKEND_URL}/api/v1/user/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id:user.uid,
          name: user.displayName,
          email: user.email,
          password: "password", 
        }),
      });
    }

    router.push(`/${username}/repositories`);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-sm text-blue-400 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-gray-900 hover:bg-gray-100"
              disabled={loading}
            >
              <img src="/google-logo.png" alt="Google" className="w-5 h-5 mr-2" />
              Sign in with Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export { LoginForm };
