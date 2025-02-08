import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Zap, ArrowRight } from "lucide-react";

const features = [
  {
    title: "Frictionless Collaboration",
    description: "Real-time sync, live cursors, no merge conflicts. Work together seamlessly with your team, no matter where they are.",
    icon: Users,
    highlights: ["Real-time collaboration", "Live cursor tracking", "Conflict-free editing"]
  },
  {
    title: "Enterprise-Ready",
    description: "Version control, role-based access, secure workspaces. Built with enterprise-grade security and compliance in mind.",
    icon: Shield,
    highlights: ["Role-based access", "Audit logging", "Data encryption"]
  },
  {
    title: "Developer Experience",
    description: "Offline capability, auto-sync, integrated communication. Everything you need to stay productive and focused.",
    icon: Zap,
    highlights: ["Offline-first", "Auto-syncing", "Built-in chat"]
  }
];

export function FeaturesSection() {
  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="flex flex-col items-center mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-100 mb-4">
            Powerful Features for Modern Teams
          </h2>
          <p className="text-gray-400 text-lg max-w-[700px]">
            Everything you need to build, collaborate, and ship faster than ever before
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative"
            >
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm h-full transition-all duration-300 hover:bg-gray-800/50 hover:border-gray-700">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gray-800 p-2.5 mb-4 group-hover:bg-gray-700 transition-colors">
                    <feature.icon className="h-full w-full text-blue-400" />
                  </div>
                  <CardTitle className="text-xl text-gray-100 mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-300">
                        <ArrowRight className="h-4 w-4 mr-2 text-blue-400" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;