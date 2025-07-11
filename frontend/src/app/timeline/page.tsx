"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import { TrendingUp, Filter, Search, Plus, RefreshCw, AlertCircle, Loader2, Sparkles, Siren as Fire, Clock, Users } from "lucide-react";
import Link from "next/link";
import { NavbarClient } from "@/components/base/navbar";
import TimelinePost from "@/components/base/TimeLinePost";

// Types based on your API response
interface ApiPost {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  created_at: string;
  expire_at: string;
  Option: Array<{
    id: number;
    option: string;
    count: number;
  }>;
  Comments: any[];
}

interface TimelinePostData {
  id: string;
  user: {
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
  };
  title: string;
  description?: string;
  optionA: {
    id: string;
    title: string;
    description: string;
    votes: number;
  };
  optionB: {
    id: string;
    title: string;
    description: string;
    votes: number;
  };
  totalVotes: number;
  comments: number;
  likes: number;
  timeAgo: string;
  category: string;
  expiresAt: string;
  isHot?: boolean;
  isTrending?: boolean;
}

const categories = [
  { name: "All", icon: "🌟", color: "emerald" },
  { name: "Tech", icon: "💻", color: "blue" },
  { name: "Health", icon: "🏥", color: "green" },
  { name: "Finance", icon: "💰", color: "yellow" },
  { name: "Lifestyle", icon: "🎨", color: "purple" },
  { name: "Career", icon: "💼", color: "orange" },
  { name: "Travel", icon: "✈️", color: "pink" }
];

const sortOptions = [
  { value: "recent", label: "Latest", icon: Clock },
  { value: "popular", label: "Popular", icon: Fire },
  { value: "votes", label: "Most Voted", icon: Users },
  { value: "trending", label: "Trending", icon: TrendingUp }
];

// Custom hook for fetching posts
function usePosts() {
  const [posts, setPosts] = useState<TimelinePostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/api/post/v1/all');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const apiPosts: ApiPost[] = result.data || [];
      
      // Transform API data to match our component structure
      const transformedPosts: TimelinePostData[] = apiPosts.map((post) => {
        const createdDate = new Date(post.created_at);
        const expireDate = new Date(post.expire_at);
        const timeAgo = formatTimeAgo(createdDate);
        const expiresIn = formatTimeAgo(expireDate, false);
        
        // Handle options - ensure we have exactly 2 options
        const options = post.Option || [];
        const optionA = options[0] || { id: 1, option: "Option A", count: 0 };
        const optionB = options[1] || { id: 2, option: "Option B", count: 0 };
        
        const totalVotes = optionA.count + optionB.count;
        
        return {
          id: post.id.toString(),
          user: {
            name: `User ${post.user_id}`,
            username: `user${post.user_id}`,
            verified: Math.random() > 0.7, // Random verification for demo
          },
          title: post.title,
          description: post.description,
          optionA: {
            id: optionA.id.toString(),
            title: optionA.option,
            description: optionA.option,
            votes: optionA.count,
          },
          optionB: {
            id: optionB.id.toString(),
            title: optionB.option,
            description: optionB.option,
            votes: optionB.count,
          },
          totalVotes,
          comments: post.Comments?.length || Math.floor(Math.random() * 50),
          likes: Math.floor(Math.random() * 200),
          timeAgo,
          category: capitalizeFirst(post.category),
          expiresAt: expiresIn,
          isHot: totalVotes > 50,
          isTrending: Math.random() > 0.8,
        };
      });
      
      setPosts(transformedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, loading, error, refetch: fetchPosts };
}

// Helper functions
function formatTimeAgo(date: Date, addSuffix: boolean = true): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return addSuffix ? 'just now' : 'now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return addSuffix ? `${minutes}m` : `${minutes}m`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return addSuffix ? `${hours}h` : `${hours}h`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return addSuffix ? `${days}d` : `${days}d`;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default function Timeline() {
  const { posts, loading, error, refetch } = usePosts();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <NavbarClient/>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-6 h-16 w-16"
            >
              <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-3">Loading Timeline</h2>
            <p className="text-zinc-400">Fetching the latest dilemmas...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <NavbarClient />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto p-8"
          >
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle size={40} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
            <p className="text-zinc-400 mb-8">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refetch}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-black px-8 py-3 font-semibold transition-all duration-200 hover:bg-emerald-400"
            >
              <RefreshCw size={18} />
              Try Again
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <NavbarClient />
      
      {/* Main Container */}
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-16 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50"
        >
          <div className="px-4 py-4">
            {/* Title */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">Timeline</h1>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-emerald-400"
                >
                  <Sparkles size={24} />
                </motion.div>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    showFilters 
                      ? 'bg-emerald-500 text-black' 
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  <Filter size={18} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refetch}
                  className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-all duration-200"
                >
                  <RefreshCw size={18} />
                </motion.button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
              <input
                type="text"
                placeholder="Search dilemmas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:bg-zinc-900/80 transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* Categories */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((category) => (
                      <motion.button
                        key={category.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                          selectedCategory === category.name
                            ? "bg-emerald-500 text-black"
                            : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50"
                        }`}
                      >
                        <span>{category.icon}</span>
                        {category.name}
                      </motion.button>
                    ))}
                  </div>

                  {/* Sort Options */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {sortOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSortBy(option.value)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                            sortBy === option.value
                              ? "bg-emerald-500 text-black"
                              : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50"
                          }`}
                        >
                          <IconComponent size={16} />
                          {option.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Posts Feed */}
        <div className="px-4 py-6">
          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <AlertCircle size={40} className="text-zinc-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No dilemmas found</h3>
              <p className="text-zinc-400 mb-8">
                {searchQuery || selectedCategory !== "All" 
                  ? "Try adjusting your search or filters."
                  : "Be the first to share a dilemma!"
                }
              </p>
              <Link href="/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-emerald-500 text-black px-8 py-3 rounded-full font-semibold hover:bg-emerald-400 transition-colors"
                >
                  <Plus size={18} />
                  Create Dilemma
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post, index) => (
                <TimelinePost key={post.id} post={post} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        {filteredPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-zinc-800/50 text-zinc-300 px-8 py-3 rounded-full font-medium hover:bg-zinc-700/50 transition-colors"
            >
              Load More
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Floating Create Button */}
      <Link href="/create">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 h-14 w-14 bg-emerald-500 text-black rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-emerald-400 transition-colors"
        >
          <Plus size={24} />
        </motion.button>
      </Link>
    </div>
  );
}