import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Sparkles, Github, Menu, X, Terminal, Cloud, Zap, MessageSquare } from "lucide-react";

export const Footer = () => (
  <footer>
    <div className="container px-4 mx-auto py-12">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Terminal className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold text-white">MindLink</span>
          </div>
          <p className="text-gray-400">Where thoughts connect, code evolves</p>
        </div>
        {[
          {
            title: "Product",
            links: ["Features", "Pricing", "Documentation", "Updates"]
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Contact"]
          },
          {
            title: "Legal",
            links: ["Privacy", "Terms", "Security", "Status"]
          }
        ].map((column, index) => (
          <div key={index}>
            <h3 className="font-bold text-white mb-4">{column.title}</h3>
            <ul className="space-y-2">
              {column.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
        <p>© 2025 MindLink IDE. All rights reserved.</p>
      </div>
    </div>
  </footer>
);