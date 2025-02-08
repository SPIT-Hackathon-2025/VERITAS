"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Terminal, Book, GitFork, Menu, X, Home, Sparkles, Settings, MessageSquare, Plus, Search, Star } from 'lucide-react';

const CreateRepoModal = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button className="bg-blue-500 hover:bg-blue-600">
        <Plus className="h-4 w-4 mr-2" />
        New Repository
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
      <DialogHeader>
        <DialogTitle className="text-white">Create a new repository</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div>
          <label className="text-sm font-medium mb-1 block text-gray-300">Repository name</label>
          <Input placeholder="my-awesome-project" className="bg-gray-800 border-gray-700 text-white" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block text-gray-300">Description (optional)</label>
          <Input placeholder="Description of your repository" className="bg-gray-800 border-gray-700 text-white" />
        </div>
        <div className="flex items-center space-x-2">
          <Input type="checkbox" className="w-4 h-4" />
          <label className="text-sm text-gray-300">Initialize with README</label>
        </div>
      </div>
      <Button className="w-full bg-blue-500 hover:bg-blue-600">Create repository</Button>
    </DialogContent>
  </Dialog>
);

const RepositoryCard = ({ repo }) => (
  <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-blue-500/50 transition-all backdrop-blur-sm">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        <Book className={`h-5 w-5 ${repo.private ? 'text-purple-500' : 'text-blue-500'}`} />
        <h3 className="text-white hover:text-blue-400 font-medium text-lg">{repo.name}</h3>
      </div>
      <span className={`text-xs px-3 py-1 rounded-full ${repo.private ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
        {repo.private ? 'Private' : 'Public'}
      </span>
    </div>
    <p className="text-gray-400 text-sm mb-4">{repo.description}</p>
    <div className="flex items-center space-x-4 text-sm text-gray-400">
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: repo.languageColor }} />
        {repo.language}
      </div>
      <div className="flex items-center">
        <Star className="h-4 w-4 mr-1" />
        {repo.stars}
      </div>
      <div className="flex items-center">
        <GitFork className="h-4 w-4 mr-1" />
        {repo.forks}
      </div>
      <span>Updated {repo.lastUpdated}</span>
    </div>
  </div>
);
const RepositoryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const sampleRepos = [
    {
      name: "mindlink-core",
      description: "Core library for MindLink IDE with real-time collaboration features",
      private: false,
      language: "TypeScript",
      languageColor: "#2b7489",
      stars: 342,
      forks: 87,
      lastUpdated: "2 days ago"
    },
    {
      name: "ai-code-assistant",
      description: "AI-powered code suggestions and autocompletion engine",
      private: true,
      language: "Python",
      languageColor: "#3572A5",
      stars: 156,
      forks: 23,
      lastUpdated: "5 hours ago"
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-700 focus:border-blue-500"
          />
        </div>
        <CreateRepoModal />
      </div>

      <div className="grid gap-4">
        {sampleRepos.map((repo, index) => (
          <RepositoryCard key={index} repo={repo} />
        ))}
      </div>
    </div>
  );
};

export default RepositoryPage;