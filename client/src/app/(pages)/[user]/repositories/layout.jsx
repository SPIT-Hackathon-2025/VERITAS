"use client";
import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
        <main 
          className={`flex-1 transition-all duration-300 ${
            isOpen ? 'ml-64' : 'ml-16'
          } mt-16 p-6`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;