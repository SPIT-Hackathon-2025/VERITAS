import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Sparkles, Github } from "lucide-react";

export function HeroSection() {
  return (
    <section className="w-full py-10 md:py-32 bg-gradient-to-b from-gray-900 to-gray-950 relative overflow-hidden">
      {/* Background gradient blobs */}
      

      <div className="container px-4 md:px-6 mx-auto max-w-6xl relative">
        <div className="flex flex-col items-center text-center space-y-10">
          {/* Badge */}
         

          {/* Main heading */}
          <div className="space-y-6">
            <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl mx-auto max-w-3xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-100 via-white to-gray-100 animate-shine bg-[length:200%_100%]">
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
            <Button size="lg" className="bg-blue-500 text-white hover:bg-blue-600 transition-colors">
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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-800">
            {[
              { label: "Active Users", value: "10K+" },
              { label: "Code Collaborations", value: "1M+" },
              { label: "GitHub Stars", value: "5K+" },
            ].map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-2xl font-bold text-gray-100">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;