"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart3, MessageSquare, ArrowUpRight, Activity, PieChart } from "lucide-react"
import SidebarClient from "@/components/base/navbar/SidebarClient"
import { useSession } from "next-auth/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import axios from "axios"

interface DashboardStats {
  totalPosts: number
  totalVotes: number
  totalComments: number
  totalOptions: number
  totalViews: number
  activeUsers: number
  postsThisWeek: number
  votesThisWeek: number
  commentsThisWeek: number
}

interface Comment {
  id: string
  content: string
  user: string
  postTitle: string
  createdAt: string
  likes: number
}

interface CategoryData {
  category: string
  count: number
  percentage: number
}

type token = string

export default function AnalysisPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalVotes: 0,
    totalComments: 0,
    totalOptions: 0,
    totalViews: 0,
    activeUsers: 0,
    postsThisWeek: 0,
    votesThisWeek: 0,
    commentsThisWeek: 0,
  })
  const [comments, setComments] = useState<Comment[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      //@ts-ignore
      if (!session?.user?.token) {
        console.warn("No token in session")
        setLoading(false)
        return
      }

      try {
        // Fetch stats
        const statsRes = await axios.get("https://analytics-server-latest.onrender.com/stats", {
          //@ts-ignore
          headers: { Authorization: `${session.user.token}`},
        })

        console.log("Stats API response:", statsRes.data)

        setStats((prev) => ({
          ...prev,
          totalPosts: statsRes.data.postCount ?? prev.totalPosts,
          totalComments: statsRes.data.commentCount ?? prev.totalComments,
          totalOptions: statsRes.data.optionCount ?? prev.totalOptions,
        }))

        // Fetch real comments from API
        const commentsRes = await axios.get("https://analytics-server-latest.onrender.com/getComments", {
          //@ts-ignore
          headers: { Authorization: `${session.user.token}`},
        })

        console.log("Comments API response:", commentsRes.data)

        // Transform API comments to match frontend interface
        const apiComments = commentsRes.data.comments?.map((comment: any) => ({
          id: comment.id.toString(),
          content: comment.comment,
          user: `user_${comment.user_id}`,
          postTitle: `Post ${comment.post_id}`,
          createdAt: new Date(comment.created_at).toLocaleDateString(),
          likes: 0,
        })) || []

        setComments(apiComments)

        // Fetch real category data from API
        const categoryRes = await axios.get("https://analytics-server-latest.onrender.com/getCategoryData", {
          //@ts-ignore
          headers: { Authorization: ` ${session.user.token}`},
        })

        console.log("Category API response:", categoryRes.data)

        // Process category data
        const rawCategories = categoryRes.data.categoryData || []
        const categoryCounts: { [key: string]: number } = {}
        
        // Count occurrences of each category
        rawCategories.forEach((item: any) => {
          const category = item.category
          categoryCounts[category] = (categoryCounts[category] || 0) + 1
        })

        // Calculate percentages and format data
        const totalPosts = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)
        const processedCategoryData: CategoryData[] = Object.entries(categoryCounts).map(([category, count]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1), 
          count,
          percentage: totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0
        })).sort((a, b) => b.count - a.count) 

        setCategoryData(processedCategoryData)
      } catch (err) {
        console.error("Error fetching stats:", err)
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchData()
    }
  }, [session, status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <SidebarClient />
        <div className="lg:ml-64 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative mx-auto mb-8 h-20 w-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-20 w-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500"
              />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Loading Analytics
            </h2>
            <p className="text-muted-foreground text-lg">
              Fetching your data...
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Please login to access Analytics.
        </p>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Posts",
      value: stats.totalPosts,
      icon: BarChart3,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      change: stats.postsThisWeek,
      changeLabel: "This week",
    },
    {
      title: "Total Comments",
      value: stats.totalComments,
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      change: stats.commentsThisWeek,
      changeLabel: "This week",
    },
    {
      title: "Total Votes",
      value: stats.totalOptions,
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      change: 0,
      changeLabel: "This week",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <SidebarClient />

      <div className="lg:ml-64 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-4"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Analytics Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Insights into your activity
                </p>
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-foreground mt-2">
                          {stat.value}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm text-emerald-500 font-medium">
                            +{stat.change}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {stat.changeLabel}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                      >
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Comments + Votes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  Recent Comments
                </CardTitle>
                <CardDescription>
                  Latest user interactions and feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-l-4 border-emerald-500 pl-4 py-2 mb-2"
                    >
                      <p className="text-sm">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {comment.user} on {comment.postTitle} • {comment.createdAt}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No comments found
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-500" />
                  Post Categories
                </CardTitle>
                <CardDescription>
                  Distribution of your posts by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <div className="space-y-4">
                    {/* Simple pie chart representation */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative w-32 h-32">
                        {categoryData.map((item, index) => {
                          const colors = [
                            "bg-emerald-500",
                            "bg-blue-500", 
                            "bg-purple-500",
                            "bg-orange-500",
                            "bg-red-500",
                            "bg-yellow-500"
                          ]
                          const startAngle = categoryData.slice(0, index).reduce((acc, curr) => acc + (curr.percentage * 3.6), 0)
                          const endAngle = startAngle + (item.percentage * 3.6)
                          
                          return (
                            <div
                              key={item.category}
                              className={`absolute w-full h-full rounded-full ${colors[index % colors.length]} opacity-80`}
                              style={{
                                clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180)}%)`
                              }}
                            />
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="space-y-2">
                      {categoryData.map((item, index) => {
                        const colors = [
                          "bg-emerald-500",
                          "bg-blue-500", 
                          "bg-purple-500",
                          "bg-orange-500",
                          "bg-red-500",
                          "bg-yellow-500"
                        ]
                        return (
                          <div key={item.category} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                              <span className="text-foreground">{item.category}</span>
                            </div>
                            <div className="text-muted-foreground">
                              {item.count} ({item.percentage}%)
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No category data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
