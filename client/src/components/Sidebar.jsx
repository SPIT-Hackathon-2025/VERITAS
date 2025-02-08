import React from "react";
import { Terminal, ChevronLeft, Home, Book, Sparkles, MessageSquare, Settings } from "lucide-react";
import { useAuth } from '@/app/hooks/useAuth';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, loading, logout } = useAuth();

  // Debugging Log
  console.log("User data:", user);

  const menuItems = [
    { icon: <Home className="h-5 w-5" />, label: "Dashboard", color: "text-blue-500" },
    { icon: <Book className="h-5 w-5" />, label: "Repositories", color: "text-purple-500" },
    { icon: <Sparkles className="h-5 w-5" />, label: "AI Copilot", color: "text-green-500" },
    { icon: <MessageSquare className="h-5 w-5" />, label: "Discussions", color: "text-yellow-500" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", color: "text-gray-400" },
  ];

  return (
    <div 
      className={`fixed left-0 top-16 h-full bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 
        transition-all duration-300 ease-in-out shadow-lg 
        ${isOpen ? 'w-64' : 'w-16'}`}
    >
      {/* Toggle button */}
      <div 
        className={`absolute -right-3 top-6 bg-gray-800 rounded-full p-1.5 cursor-pointer
          transform transition-transform duration-300 hover:scale-110 shadow-lg
          ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        onClick={toggleSidebar}
      >
        <ChevronLeft className="h-4 w-4 text-gray-300" />
      </div>

      {/* Logo section */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-center">
          {isOpen && (
            <span className="text-lg font-semibold text-emerald-500">
              {user?.displayName || "Guest"}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-2">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`group flex items-center p-2 rounded-lg cursor-pointer
              transition-all duration-200 hover:bg-gray-800/40
              ${isOpen ? 'justify-start' : 'justify-center'}`}
          >
            <div className={`${item.color} transition-transform duration-200 group-hover:scale-110`}>
              {item.icon}
            </div>
            {isOpen && (
              <span className={`ml-3 text-gray-300 group-hover:text-white
                transition-all duration-200  translate-x-3
                group-hover:opacity-100 group-hover:translate-x-0`}>
                {item.label}
              </span>
            )}
            {!isOpen && (
              <div className="fixed left-16 ml-6 scale-0 group-hover:scale-100 z-50
                bg-gray-800 text-white px-2 py-1 rounded shadow-xl transition-all duration-200">
                {item.label}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800/50">
        <div className={`flex items-center ${isOpen ? 'justify-start' : 'justify-center'} 
          text-gray-400 hover:text-white transition-colors duration-200`}>
          <div className="relative">
            <img
              src="/api/placeholder/32/32"
              alt="Profile"
              className="w-8 h-8 rounded-full border-2 border-gray-700"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          {isOpen && <span className="ml-3 text-sm font-medium">{user?.name || "Guest"}</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
