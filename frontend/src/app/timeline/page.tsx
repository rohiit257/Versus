"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Calendar, Clock, Tag, User, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { NavbarClient } from "@/components/base/navbar";


// Types
interface Post {
  user_id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  created_at: string;
  expire_at: string;
}

// Custom hook for posts
function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
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
      
      const data = await response.json();
      console.log(data)
      
      // Handle different possible response structures
      if (Array.isArray(data)) {
        setPosts(data);
      } else if (data.posts && Array.isArray(data.posts)) {
        setPosts(data.posts);
      } else if (data.data && Array.isArray(data.data)) {
        setPosts(data.data);
      } else {
        throw new Error('Invalid response format');
      }
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

// Post Card Component
function PostCard({ post, index }: { post: Post; index: number }) {
  const createdDate = new Date(post.created_at);
  const expireDate = new Date(post.expire_at);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });
  const expiresIn = formatDistanceToNow(expireDate, { addSuffix: false });

  const getCategoryColor = (category: string) => {
    const colors = {
      tech: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      lifestyle: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      business: "bg-green-500/10 text-green-400 border-green-500/20",
      entertainment: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      sports: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      default: "bg-gray-500/10 text-gray-400 border-gray-500/20"
    };
    return colors[category.toLowerCase() as keyof typeof colors] || colors.default;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          src={post.image.startsWith('http') ? post.image : `http://localhost:8000/uploads/${post.image}`}
          alt={post.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop&crop=entropy&auto=format&q=80`;
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getCategoryColor(post.category)}`}>
            <Tag size={12} />
            {post.category}
          </span>
        </div>

        {/* Expiry Indicator */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1.5 rounded-full bg-zinc-900/80 px-3 py-1 text-xs text-zinc-300 backdrop-blur-sm">
            <Clock size={12} />
            Expires in {expiresIn}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <motion.h2
            whileHover={{ color: "#10b981" }}
            className="text-xl font-bold text-white line-clamp-2 cursor-pointer transition-colors duration-200"
          >
            {post.title}
          </motion.h2>
          <p className="mt-2 text-zinc-400 line-clamp-3 leading-relaxed">
            {post.description}
          </p>
        </div>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <User size={14} />
              <span>User {post.user_id}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{timeAgo}</span>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg bg-emerald-600/20 px-4 py-2 text-emerald-400 transition-all duration-200 hover:bg-emerald-600/30"
          >
            View Details
          </motion.button>
        </div>
      </div>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      />
    </motion.article>
  );
}

// Main Page Component
export default function Home() {
  const { posts, loading, error, refetch } = usePosts();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
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
              className="mx-auto mb-4 h-12 w-12 text-emerald-400"
            >
              <Loader2 size={48} />
            </motion.div>
            <h2 className="text-xl font-semibold text-white mb-2">Loading Posts</h2>
            <p className="text-zinc-400">Fetching the latest content for you...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <NavbarClient />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto p-8"
          >
            <div className="mx-auto mb-4 h-16 w-16 text-red-400">
              <AlertCircle size={64} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
            <p className="text-zinc-400 mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refetch}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-white font-medium transition-all duration-200 hover:bg-emerald-500"
            >
              <RefreshCw size={16} />
              Try Again
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <NavbarClient />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto p-8"
          >
            <div className="mx-auto mb-4 h-16 w-16 text-zinc-400">
              <AlertCircle size={64} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Posts Found</h2>
            <p className="text-zinc-400 mb-6">There are no posts available at the moment.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refetch}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-white font-medium transition-all duration-200 hover:bg-emerald-500"
            >
              <RefreshCw size={16} />
              Refresh
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <NavbarClient />
      
      {/* Header */}
      <div className="border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent"
              >
                Latest Posts
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-2 text-zinc-400"
              >
                Discover {posts.length} amazing posts from our community
              </motion.p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refetch}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-800/50 px-4 py-2 text-zinc-300 transition-all duration-200 hover:bg-zinc-700/50 hover:text-emerald-400"
            >
              <RefreshCw size={16} />
              Refresh
            </motion.button>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <PostCard key={`${post.user_id}-${post.created_at}`} post={post} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}