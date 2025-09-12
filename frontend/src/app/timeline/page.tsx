"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import {
  RefreshCw,
  AlertCircle,
  Activity,
  MessageCircle,
} from "lucide-react"
import SidebarClient from "@/components/base/navbar/SidebarClient"
import RightSidebar from "@/components/base/navbar/RightSidebar"
import TimelinePost from "@/components/base/TimeLinePost"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useSession } from "next-auth/react";
import { BACKEND_URL } from "@/lib/apiEndPoints"

// Types based on your API response
interface ApiPost {
  id: number
  user_id: number
  title: string
  description: string
  category: string
  image: string
  created_at: string
  expire_at: string
  Option: Array<{
    id: number
    option: string
    count: number
  }>
  Comments: Array<{
    id: number
    comment: string
    created_at: string
    user?: {
      id: number
      name: string
      email: string
    }
  }>
  user: {
    id: number
    name: string
    email: string
  }
}

interface TimelinePostData {
  id: string
  user: {
    name: string
    username: string
    avatar?: string
    verified?: boolean
  }
  title: string
  description?: string
  options: Array<{
    id: string
    title: string
    votes: number
  }>
  totalVotes: number
  comments: number
  commentsList: Array<{
    id: number
    content: string
    created_at: string
    user?: {
      id: number
      name: string
      email: string
    }
  }>
  likes: number
  timeAgo: string
  category: string
  expiresAt: string
  isHot?: boolean
  isTrending?: boolean
}

// Custom hook for fetching posts, with support for initialData
function usePosts(initialData?: any) {
  const [posts, setPosts] = useState<TimelinePostData[]>(() => {
    if (initialData && initialData.data) {
      const apiPosts: ApiPost[] = initialData.data || [];
      return apiPosts
        .filter((post) => {
          const options = post.Option || [];
          return options.length >= 2 && options.every(opt => opt.option);
        })
        .map((post) => {
          const createdDate = new Date(post.created_at);
          const expireDate = new Date(post.expire_at);
          const timeAgo = formatTimeAgo(createdDate);
          const expiresIn = formatTimeAgo(expireDate, false);
          const options = (post.Option || []).map(opt => ({
            id: opt.id.toString(),
            title: opt.option,
            votes: opt.count,
          }));
          const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);
          return {
            id: post.id.toString(),
            user: {
              name: post.user?.name || `User ${post.user_id}`,
              username: post.user?.email?.split('@')[0] || `user${post.user_id}`,
              verified: Math.random() > 0.7,
            },
            title: post.title,
            description: post.description,
            options,
            totalVotes,
            comments: post.Comments?.length || 0,
            commentsList: (post.Comments || []).map(c => ({
              id: c.id,
              content: c.comment,
              created_at: c.created_at,
              user: c.user ? {
                id: c.user.id,
                name: c.user.name,
                email: c.user.email
              } : undefined
            })),
            likes: Math.floor(Math.random() * 200),
            timeAgo,
            category: capitalizeFirst(post.category),
            expiresAt: expiresIn,
            isHot: totalVotes > 50,
            isTrending: Math.random() > 0.8,
          };
        });
    }
    return [];
  });
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${BACKEND_URL}/api/post/v1/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const apiPosts: ApiPost[] = result.data || [];
      const transformedPosts: TimelinePostData[] = apiPosts
        .filter((post) => {
          const options = post.Option || [];
          return options.length >= 2 && options.every(opt => opt.option);
        })
        .map((post) => {
          const createdDate = new Date(post.created_at);
          const expireDate = new Date(post.expire_at);
          const timeAgo = formatTimeAgo(createdDate);
          const expiresIn = formatTimeAgo(expireDate, false);
          const options = (post.Option || []).map(opt => ({
            id: opt.id.toString(),
            title: opt.option,
            votes: opt.count,
          }));
          const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);
          return {
            id: post.id.toString(),
            user: {
              name: post.user?.name || `User ${post.user_id}`,
              username: post.user?.email?.split('@')[0] || `user${post.user_id}`,
              verified: Math.random() > 0.7,
            },
            title: post.title,
            description: post.description,
            options,
            totalVotes,
            comments: post.Comments?.length || 0,
            commentsList: (post.Comments || []).map(c => ({
              id: c.id,
              content: c.comment,
              created_at: c.created_at,
              user: c.user ? {
                id: c.user.id,
                name: c.user.name,
                email: c.user.email
              } : undefined
            })),
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
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) fetchPosts();
  }, []);

  return { posts, loading, error, refetch: fetchPosts };
}

// Helper functions
function formatTimeAgo(date: Date, addSuffix = true): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return addSuffix ? "just now" : "now"
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return addSuffix ? `${minutes}m` : `${minutes}m`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return addSuffix ? `${hours}h` : `${hours}h`
  }
  const days = Math.floor(diffInSeconds / 86400)
  return addSuffix ? `${days}d` : `${days}d`
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

type EnhancedTimelineProps = {
  initialData?: any;
};

export default function Page() {
  const { posts, loading, error, refetch } = usePosts();
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { data: session } = useSession();
  const user = session?.user as { id?: string | number } | undefined;

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SidebarClient />
        <RightSidebar />
        <div className="lg:ml-64 lg:mr-80 flex items-center justify-center min-h-screen px-4">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.div className="relative mx-auto mb-8 h-20 w-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-20 w-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border-2 border-blue-500/20 border-b-blue-500"
              />
            </motion.div>
            <motion.h2
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl font-bold text-foreground mb-4"
            >
              Loading Timeline
            </motion.h2>
            <p className="text-muted-foreground text-lg">Fetching the latest posts...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <SidebarClient />
        <RightSidebar />
        <div className="lg:ml-64 lg:mr-80 flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto p-8"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mx-auto mb-8 h-24 w-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20"
            >
              <AlertCircle size={48} className="text-red-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-8 text-lg">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refetch}
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black px-8 py-4 font-bold text-lg transition-all duration-200 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25"
            >
              <RefreshCw size={20} />
              Try Again
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Left Sidebar */}
      <SidebarClient />

      {/* Right Sidebar */}
      <RightSidebar />

      {/* Main Content - Timeline */}
      <main className="lg:ml-64 lg:mr-80 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/50">
          <div className="px-4 lg:px-8 py-4 lg:py-6">
            {/* Main Header Row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex flex-col">
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Timeline</h1>
                    <p className="text-sm text-muted-foreground">Discover and vote on trending topics</p>
                  </div>
                </motion.div>
              </div>

              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-foreground hover:bg-muted/70 transition-all duration-300 border border-border/50 hover:border-border"
              >
                <div className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}>
                  {isRefreshing ? (
                    <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-foreground/40 border-t-foreground rounded-full" />
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{isRefreshing ? "Refreshing..." : "Refresh"}</span>
              </motion.button>
            </div>

            {/* Secondary Info Row */}
            <div className="flex items-center justify-between">
              {/* Breadcrumb */}
              <Breadcrumb className="text-xs lg:text-sm" />
              
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-emerald-400">Live</span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <span className="text-xs font-medium text-blue-400">{posts.length} Posts</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Timeline Posts */}
        <div className="px-4 lg:px-8 py-6">
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <MessageCircle size={24} className="text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
              <p className="text-zinc-400 mb-6">Be the first to create a post and start the conversation!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-semibold transition-all duration-200 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25"
              >
                <Activity size={16} />
                Create First Post
              </motion.button>
            </motion.div>
          ) : (
            <motion.div className="space-y-6">
              <AnimatePresence>
                {posts.map((post, idx) => (
                  <TimelinePost key={post.id} post={post} index={idx} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}