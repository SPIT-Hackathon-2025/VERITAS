"use client";
import React from "react";
import { Terminal, ChevronLeft, ChevronRight, Home, Book, Sparkles, MessageSquare, Settings } from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => (
  <div className={`fixed left-0 top-16 h-full bg-gray-900/80 backdrop-blur-sm text-gray-100 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} border-r border-gray-800`}>
   
    
    <nav className="p-2">
      {[
        { icon: <Home className="h-5 w-5" />, label: "Dashboard", color: "text-blue-500" },
        { icon: <Book className="h-5 w-5" />, label: "Repositories", color: "text-purple-500" },
        { icon: <Sparkles className="h-5 w-5" />, label: "AI Copilot", color: "text-green-500" },
        { icon: <MessageSquare className="h-5 w-5" />, label: "Discussions", color: "text-yellow-500" },
        { icon: <Settings className="h-5 w-5" />, label: "Settings", color: "text-gray-400" },
      ].map((item, index) => (
        <div
          key={index}
          className={`flex items-center p-2 hover:bg-gray-800/50 rounded-md cursor-pointer my-1 ${isOpen ? "justify-start" : "justify-center"}`}
        >
          <div className={item.color}>{item.icon}</div>
          {isOpen && <span className="ml-3 text-gray-300 hover:text-white">{item.label}</span>}
        </div>
      ))}
        </nav>
        
         <div className="p-4 border-b border-gray-800 flex items-center justify-between">
      {isOpen ? (
        <>
        
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </>
      ) : (
        <button onClick={toggleSidebar} className="mx-auto text-gray-400 hover:text-white">
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  </div>
);

export default Sidebar;
