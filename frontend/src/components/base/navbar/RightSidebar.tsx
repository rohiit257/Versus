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
    <aside className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border flex flex-col py-6 z-40 hidden lg:flex">
      {/* Search Bar */}
      <div className="px-5 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/20 border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-emerald-400 focus:bg-muted/30 transition-all duration-200"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 mb-6">
        <h3 className="text-base font-semibold text-foreground mb-3">Categories</h3>
        <div className="space-y-1.5">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 border text-sm font-medium
                ${
                  selectedCategory === category.id
                    ? "bg-muted/40 text-foreground border-border shadow"
                    : "text-foreground border-transparent hover:bg-muted/30 hover:border-border"
                }`}
            >
              <div className="flex items-center">
                <category.icon size={15} className="mr-2" />
                <span>{category.name}</span>
              </div>
              <span className="text-xs bg-muted/30 px-2 py-0.5 rounded text-muted-foreground font-normal">
                {category.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="px-5 mb-6">
        <h3 className="text-base font-semibold text-foreground mb-3">Trending Topics</h3>
        <div className="space-y-2">
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.01 }}
              className="bg-muted/20 rounded-lg p-3 hover:bg-muted/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-sm font-medium text-foreground leading-tight line-clamp-2">{topic.title}</h4>
                <span className="text-xs text-muted-foreground font-medium">{topic.votes} votes</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground capitalize">{topic.category}</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp size={11} />
                  <span>Trending</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-5 mb-6">
        <h3 className="text-base font-semibold text-foreground mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.01 }}
              className="bg-muted/10 rounded p-2 hover:bg-muted/20 transition-all duration-200"
            >
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-muted/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-foreground">
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="text-foreground font-medium">{activity.post}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-5">
        <div className="bg-muted/20 rounded-lg p-3">
          <h3 className="text-base font-semibold text-foreground mb-2">Today's Stats</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Eye size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total Views</span>
              </div>
              <span className="text-xs font-bold text-foreground">12.4K</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MessageCircle size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Comments</span>
              </div>
              <span className="text-xs font-bold text-foreground">847</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Heart size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Votes Cast</span>
              </div>
              <span className="text-xs font-bold text-foreground">2.1K</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
} 