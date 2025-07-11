"use client"
import { motion } from "framer-motion"
import { Search, TrendingUp, Users, Calendar, Star, Zap, Target, Heart, MessageCircle, Eye } from "lucide-react"
import { useState } from "react"

const categories = [
  { id: "all", name: "All Posts", icon: TrendingUp, count: 156 },
  { id: "tech", name: "Technology", icon: Zap, count: 42 },
  { id: "health", name: "Health", icon: Heart, count: 28 },
  { id: "finance", name: "Finance", icon: Target, count: 35 },
  { id: "lifestyle", name: "Lifestyle", icon: Users, count: 31 },
  { id: "career", name: "Career", icon: Calendar, count: 20 },
]

const trendingTopics = [
  { title: "AI in Healthcare", votes: 1247, category: "tech" },
  { title: "Remote Work Tips", votes: 892, category: "career" },
  { title: "Crypto Investment", votes: 756, category: "finance" },
  { title: "Mental Wellness", votes: 634, category: "health" },
  { title: "Sustainable Living", votes: 521, category: "lifestyle" },
]

const recentActivity = [
  { user: "Sarah M.", action: "voted on", post: "Best Programming Languages 2024", time: "2m ago" },
  { user: "Alex K.", action: "commented on", post: "Remote Work Productivity", time: "5m ago" },
  { user: "Mike R.", action: "created", post: "AI vs Human Creativity", time: "8m ago" },
  { user: "Emma L.", action: "voted on", post: "Healthy Morning Routines", time: "12m ago" },
]

export default function RightSidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  return (
    <aside className="fixed right-0 top-0 h-full w-80 bg-black border-l border-zinc-800 flex flex-col py-8 z-40 shadow-2xl shadow-black/20">
      {/* Search Bar */}
      <div className="px-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500/50 focus:bg-zinc-800/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 border ${
                selectedCategory === category.id
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-zinc-800/30 text-zinc-400 border-zinc-700/40 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
              }`}
            >
              <div className="flex items-center">
                <category.icon size={16} className="mr-3" />
                <span className="font-medium">{category.name}</span>
              </div>
              <span className="text-xs bg-zinc-700/50 px-2 py-1 rounded-full">
                {category.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-4">Trending Topics</h3>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-white leading-tight">{topic.title}</h4>
                <span className="text-xs text-emerald-400 font-medium">{topic.votes} votes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 capitalize">{topic.category}</span>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <TrendingUp size={12} />
                  <span>Trending</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.01 }}
              className="bg-zinc-900/30 border border-zinc-700/30 rounded-lg p-3 hover:border-emerald-500/20 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-emerald-400">
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-zinc-400">{activity.action}</span>{" "}
                    <span className="text-emerald-400 font-medium">{activity.post}</span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">{activity.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-6">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-xl p-4">
          <h3 className="text-lg font-bold text-emerald-400 mb-3">Today's Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-zinc-400" />
                <span className="text-sm text-zinc-300">Total Views</span>
              </div>
              <span className="text-sm font-bold text-white">12.4K</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-zinc-400" />
                <span className="text-sm text-zinc-300">Comments</span>
              </div>
              <span className="text-sm font-bold text-white">847</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-zinc-400" />
                <span className="text-sm text-zinc-300">Votes Cast</span>
              </div>
              <span className="text-sm font-bold text-white">2.1K</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
} 