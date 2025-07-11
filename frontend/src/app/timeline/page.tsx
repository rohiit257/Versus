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
import TimelinePost from "@/components/base/TimeLinePost"

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
  Comments: any[]
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
  likes: number
  timeAgo: string
  category: string
  expiresAt: string
  isHot?: boolean
  isTrending?: boolean
}

// Custom hook for fetching posts
function usePosts() {
  const [posts, setPosts] = useState<TimelinePostData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("http://localhost:8000/api/post/v1/all")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      const apiPosts: ApiPost[] = result.data || []

      // Transform API data to match our component structure
      const transformedPosts: TimelinePostData[] = apiPosts
        .filter((post) => {
          // Filter out posts without valid options (must have at least 2)
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
              name: `User ${post.user_id}`,
              username: `user${post.user_id}`,
              verified: Math.random() > 0.7,
            },
            title: post.title,
            description: post.description,
            options,
            totalVotes,
            comments: post.Comments?.length || 0,
            likes: Math.floor(Math.random() * 200),
            timeAgo,
            category: capitalizeFirst(post.category),
            expiresAt: expiresIn,
            isHot: totalVotes > 50,
            isTrending: Math.random() > 0.8,
          };
        });

      setPosts(transformedPosts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts")
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return { posts, loading, error, refetch: fetchPosts }
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

export default function EnhancedTimeline() {
  const { posts, loading, error, refetch } = usePosts()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <SidebarClient />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
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
              className="text-3xl font-bold text-white mb-4"
            >
              Loading Timeline
            </motion.h2>
            <p className="text-zinc-400 text-lg">Fetching the latest posts...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <SidebarClient />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
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
            <h2 className="text-3xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-zinc-400 mb-8 text-lg">{error}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex relative">
      <SidebarClient />

      {/* Fixed Glassy Header with Search */}
      <header className="fixed left-20 top-0 right-0 z-30 h-16 flex items-center justify-center px-8 border-b border-zinc-800/60 bg-zinc-950/60 backdrop-blur-md shadow-lg">
        <div className="w-full max-w-md flex items-center bg-zinc-800/80 border border-zinc-700 rounded-full px-4 py-2">
          <svg className="w-5 h-5 text-zinc-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent outline-none border-none text-white placeholder-zinc-400 text-base"
          />
        </div>
      </header>

      {/* Posts Feed */}
      <main className="max-w-2xl mx-auto px-6 pt-24 pb-16 flex-1">
        {posts.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-32">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mx-auto mb-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/10 to-blue-500/10 flex items-center justify-center border-4 border-emerald-500/20 shadow-2xl"
            >
              <MessageCircle size={64} className="text-emerald-400" />
            </motion.div>
            <h3 className="text-3xl font-bold text-emerald-200 mb-4">No posts yet</h3>
            <p className="text-zinc-400 mb-8 text-lg max-w-md mx-auto">
              Be the first to start a conversation!
            </p>
            <button className="mt-4 px-6 py-3 rounded-full bg-emerald-500 text-black font-bold text-lg shadow-lg hover:bg-emerald-400 transition-all">Create Post</button>
          </motion.div>
        ) : (
          <motion.div layout className="space-y-12">
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                >
                  <TimelinePost post={post} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Floating Action Button (FAB) for Create Post */}
        <button
          className="fixed bottom-8 right-8 z-40 flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 text-black font-bold text-lg shadow-xl hover:from-emerald-400 hover:to-blue-400 transition-all duration-200"
          style={{ boxShadow: '0 8px 32px 0 rgba(16,185,129,0.25)' }}
        >
          <span className="text-xl">+</span> Create Post
        </button>
      </main>
    </div>
  )
}