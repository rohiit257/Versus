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
    <aside className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border flex flex-col py-8 z-40 shadow-2xl shadow-black/20 dark:shadow-white/5 hidden lg:flex">
      {/* Search Bar */}
      <div className="px-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-border focus:bg-muted/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 border ${
                selectedCategory === category.id
                  ? "bg-muted/50 text-foreground border-border"
                  : "text-foreground border-transparent hover:bg-muted/30 hover:border-border"
              }`}
            >
              <div className="flex items-center">
                <category.icon size={16} className="mr-3" />
                <span className="font-medium">{category.name}</span>
              </div>
              <span className="text-xs bg-muted/50 px-2 py-1 rounded-full text-foreground">
                {category.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Trending Topics</h3>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="bg-muted/30 border border-border rounded-xl p-4 hover:bg-muted/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground leading-tight">{topic.title}</h4>
                <span className="text-xs text-foreground font-medium">{topic.votes} votes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground capitalize">{topic.category}</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.01 }}
              className="bg-muted/20 border border-border rounded-lg p-3 hover:bg-muted/40 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-foreground">
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="text-foreground font-medium">{activity.post}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-6">
        <div className="bg-muted/30 border border-border rounded-xl p-4">
          <h3 className="text-lg font-bold text-foreground mb-3">Today's Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Views</span>
              </div>
              <span className="text-sm font-bold text-foreground">12.4K</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Comments</span>
              </div>
              <span className="text-sm font-bold text-foreground">847</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Votes Cast</span>
              </div>
              <span className="text-sm font-bold text-foreground">2.1K</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
} 