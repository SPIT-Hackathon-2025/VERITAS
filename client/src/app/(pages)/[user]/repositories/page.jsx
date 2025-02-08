"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Terminal, Book, GitFork, Menu, X, Home, Sparkles, Settings, MessageSquare, Plus, Search, Star } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/app/hooks/useAuth';

const CreateRepoModal = ({ onRepoCreated, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/repo/create-repo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          private: formData.isPrivate,
          user_id: user.uid
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create repository');
      }

      setIsOpen(false);
      setFormData({ name: '', description: '', isPrivate: false });
      onRepoCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block text-gray-300">Repository name</label>
            <Input 
              required
              placeholder="my-awesome-project"
              className="bg-gray-800 border-gray-700 text-white"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-gray-300">Description (optional)</label>
            <Input 
              placeholder="Description of your repository"
              className="bg-gray-800 border-gray-700 text-white"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Input 
              type="checkbox"
              className="w-4 h-4"
              checked={formData.isPrivate}
              onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
            />
            <label className="text-sm text-gray-300">Private repository</label>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-blue-500 hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create repository'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

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
      {repo.language && (
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: repo.languageColor }} />
          {repo.language}
        </div>
      )}
      {repo.stars && (
        <div className="flex items-center">
          <Star className="h-4 w-4 mr-1" />
          {repo.stars}
        </div>
      )}
      {repo.forks && (
        <div className="flex items-center">
          <GitFork className="h-4 w-4 mr-1" />``
          {repo.forks}
        </div>
      )}
      <span>Updated {repo.lastUpdated}</span>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12">
    <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-white mb-2">No repositories yet</h3>
    <p className="text-gray-400 mb-6">Create your first repository to get started</p>
  </div>
);

const RepositoryPage = () => {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRepositories = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/repo/get-user-repos/${user.uid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      setRepositories(data);
    } catch (err) {
      setError('Failed to load repositories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRepositories();
    }
  }, [user]);

  const filteredRepos = repositories.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert>
          <AlertDescription>Please log in to view your repositories.</AlertDescription>
        </Alert>
      </div>
    );
  }

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
        <CreateRepoModal onRepoCreated={fetchRepositories} user={user} />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : repositories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {filteredRepos.map((repo, index) => (
            <RepositoryCard key={index} repo={repo} />
          ))}
          {filteredRepos.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No repositories match your search
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RepositoryPage;