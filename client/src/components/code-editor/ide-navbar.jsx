import React, { useState } from 'react';
import { Play, GitBranch, Settings, File, Folder, Search, Terminal, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleShare = () => {
    console.log("Sharing with:", email);
    setEmail("");
    setIsShareOpen(false);
  };

  return (
    <>
      <nav className="h-12 bg-[#011627] border-b border-[#1d3b53] flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-[#d6deeb] font-medium">Web IDE</h1>
          <div className="flex space-x-2">
            <button className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group">
              <File className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
            </button>
            <button className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group">
              <Folder className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
            </button>
            <button className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group">
              <Search className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
            </button>
            <button className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group">
              <GitBranch className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-3 py-1.5 bg-[#7fdbca] text-[#011627] rounded-md text-sm flex items-center gap-2 hover:bg-[#9ce0d0] transition-colors font-medium">
            <Play className="w-4 h-4" />
            Run
          </button>
       
          <button 
            className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group"
            onClick={() => setIsShareOpen(true)}
          >
            <Share2 className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
          </button>
          <button className="p-1.5 hover:bg-[#1d3b53] rounded-md transition-colors group">
            <Settings className="w-4 h-4 text-[#82aaff] group-hover:text-[#c5e4fd]" />
          </button>
        </div>
      </nav>

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="bg-[#011627] border border-[#1d3b53] text-[#d6deeb]">
          <DialogHeader>
            <DialogTitle className="text-[#d6deeb]">Share Repository</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="email"
                placeholder="Enter email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1d3b53] border-[#1d3b53] text-[#d6deeb] placeholder:text-[#4f6479]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsShareOpen(false)}
              className="bg-transparent border-[#1d3b53] text-[#d6deeb] hover:bg-[#1d3b53] hover:text-[#c5e4fd]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleShare}
              className="bg-[#7fdbca] text-[#011627] hover:bg-[#9ce0d0]"
            >
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}