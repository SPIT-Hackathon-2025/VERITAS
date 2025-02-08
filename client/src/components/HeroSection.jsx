"use client";

import React from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";

export function HeroSection() {
  const router = useRouter(); // Initialize router

  return (
    <section className="w-full py-10 md:py-32 bg-gradient-to-b from-gray-900 to-gray-950 relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl relative">
        <div className="flex flex-col items-center text-center space-y-10">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl mx-auto max-w-3xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-100 via-white to-gray-100">
                Mind Link
              </span>
              <span className="text-gray-400 font-mono"> IDE</span>
            </h1>

            <p className="text-xl text-blue-400 font-mono">
              Where thoughts connect, code evolves
            </p>

            <p className="mx-auto max-w-2xl text-gray-400 text-lg leading-relaxed">
              Experience the future of collaborative development with real-time 
              sync, intelligent code suggestions, and seamless remote pair programming.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              onClick={() => router.push("/auth/login")} // Navigate on click
            >
              Start Coding
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button 
              size="lg"
              variant="outline" 
              className="text-gray-100 border-gray-700 hover:bg-gray-800"
            >
              <Github className="mr-2 h-4 w-4" />
              Star on GitHub
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
