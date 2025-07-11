"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import {
  MessageCircle,
  Share2,
  Clock,
  TrendingUp,
  Timer,
  CheckCircle,
  Wifi,
  WifiOff,
  Loader2,
  Heart,
  MoreHorizontal,
  Bookmark,
  Flag,
  Eye,
} from "lucide-react"
import CountUp from "react-countup"
import socket, { socketManager } from "@/lib/socket"
import { useSession } from "next-auth/react"

interface TimelinePostProps {
  post: {
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
    category?: string
    expiresAt?: string
    isHot?: boolean
    isTrending?: boolean
  }
  index: number
}

export default function EnhancedTimelinePost({ post, index }: TimelinePostProps) {
  const [userVote, setUserVote] = useState<string | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [voteTimeout, setVoteTimeout] = useState<NodeJS.Timeout | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const { data: session } = useSession()
  const user = session?.user as { token?: string; id?: string; email?: string } | undefined

  const [optionVotes, setOptionVotes] = useState(post.options.map(opt => opt.votes));
  const [totalVotes, setTotalVotes] = useState(post.totalVotes);
  const [animateVote, setAnimateVote] = useState<{ optionId: string | null, trigger: boolean }>({ optionId: null, trigger: false });

  useEffect(() => {
    setIsConnected(socketManager.isConnected());
    const storedVote = localStorage.getItem(`vote_${post.id}_${user?.id || user?.email}`);
    if (storedVote) {
      setUserVote(storedVote);
      setHasVoted(true);
    }
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleVoteUpdate = (data: any) => {
      if (data.post_id === Number.parseInt(post.id)) {
        if (data.options && Array.isArray(data.options)) {
          const newVotes = post.options.map(opt => {
            const updated = data.options.find((o: any) => o.id === Number(opt.id));
            return updated ? updated.count : opt.votes;
          });
          setOptionVotes(newVotes);
          setTotalVotes(newVotes.reduce((sum, v) => sum + v, 0));
        }
        if (data.user_vote && data.user_id === (user?.id || user?.email)) {
          setUserVote(data.user_vote);
          setHasVoted(true);
          localStorage.setItem(`vote_${post.id}_${user?.id || user?.email}`, data.user_vote);
        }
        setIsVoting(false);
        if (voteTimeout) {
          clearTimeout(voteTimeout);
          setVoteTimeout(null);
        }
      }
    };

    const handleVoteSuccess = (data: any) => {
      if (data.post_id === Number.parseInt(post.id) && data.user_id === (user?.id || user?.email)) {
        setHasVoted(true)
        setIsVoting(false)

        if (data.option) {
          localStorage.setItem(`vote_${post.id}_${user?.id || user?.email}`, data.option)
        }

        if (voteTimeout) {
          clearTimeout(voteTimeout)
          setVoteTimeout(null)
        }
      }
    }

    const handleVoteError = (error: any) => {
      setIsVoting(false)
      setUserVote(null)
      setHasVoted(false)

      if (voteTimeout) {
        clearTimeout(voteTimeout)
        setVoteTimeout(null)
      }
    }

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on(`vote-update-${post.id}`, handleVoteUpdate)
    socket.on("vote-update", handleVoteUpdate)
    socket.on("vote-success", handleVoteSuccess)
    socket.on("vote-error", handleVoteError)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off(`vote-update-${post.id}`, handleVoteUpdate)
      socket.off("vote-update", handleVoteUpdate)
      socket.off("vote-success", handleVoteSuccess)
      socket.off("vote-error", handleVoteError)

      if (voteTimeout) {
        clearTimeout(voteTimeout)
      }
    }
  }, [post.id, voteTimeout, user?.id, user?.email])

  if (!post.options || post.options.length < 2) {
    return null;
  }

  const handleVote = async (optionId: string) => {
    if (!isConnected || isVoting || hasVoted || !user) return;
    setIsVoting(true);
    setUserVote(optionId);
    setAnimateVote({ optionId, trigger: true });
    // Optimistically increment the vote count for the selected option
    setOptionVotes(prevVotes => {
      const idx = post.options.findIndex(opt => opt.id === optionId);
      if (idx === -1) return prevVotes;
      const newVotes = [...prevVotes];
      newVotes[idx] = newVotes[idx] + 1;
      setTotalVotes(tot => tot + 1);
      return newVotes;
    });
    const voteData = {
      post_id: Number.parseInt(post.id),
      option_id: Number.parseInt(optionId),
      user_id: user.id || user.email || "anonymous",
      user_token: user.token,
      timestamp: new Date().toISOString(),
    };
    try {
      socket.emit("vote", voteData);
      const timeout = setTimeout(() => {
        setIsVoting(false);
        setUserVote(null);
        setVoteTimeout(null);
      }, 5000);
      setVoteTimeout(timeout);
    } catch (error) {
      setIsVoting(false);
      setUserVote(null);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      tech: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      health: "bg-green-500/10 text-green-400 border-green-500/20",
      finance: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      lifestyle: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      career: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      travel: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      default: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    }
    return colors[category?.toLowerCase() as keyof typeof colors] || colors.default
  }

  const total = totalVotes || 1;
  const percentages = optionVotes.map(v => total > 0 ? Math.round((v / total) * 100) : 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative bg-gradient-to-br from-zinc-900/90 via-zinc-950/80 to-zinc-900/90 border border-zinc-800 rounded-3xl p-8 mb-8 shadow-xl shadow-emerald-500/10 flex flex-col gap-6 transition-all duration-300 hover:shadow-emerald-400/20"
    >
      {/* Header: Avatar, Name, Username, Verified, Time, Category */}
      <div className="flex items-start gap-3 pb-4 border-b border-zinc-800/60 mb-4">
        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-700 dark:text-white">
          {post.user.avatar ? (
            <img src={post.user.avatar} alt={post.user.name} className="h-12 w-12 rounded-full object-cover" />
          ) : (
            post.user.name.charAt(0)
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-white">{post.user.name}</span>
            {post.user.verified && <CheckCircle size={16} className="text-blue-400" />}
            <span className="text-zinc-500 text-sm">@{post.user.username}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-zinc-400">{post.timeAgo}</span>
            {post.category && <span className="text-xs text-emerald-500 font-medium">· {post.category}</span>}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div>
        <h2 className="text-xl font-bold text-white mb-2 leading-snug">{post.title}</h2>
        {post.description && <p className="text-zinc-300 text-base leading-relaxed">{post.description}</p>}
      </div>

      {/* Voting Options */}
      <div className="flex flex-col gap-3 mt-2">
        {post.options.map((opt, idx) => {
          const isSelected = userVote === opt.id;
          return (
            <motion.button
              key={opt.id}
              whileHover={{ scale: !hasVoted && isConnected ? 1.02 : 1 }}
              whileTap={{ scale: !hasVoted && isConnected ? 0.98 : 1 }}
              onClick={() => !hasVoted && isConnected && handleVote(opt.id)}
              disabled={!isConnected || hasVoted || isVoting}
              className={`relative flex items-center w-full px-6 py-4 rounded-2xl border transition-all duration-200 overflow-hidden
                ${isSelected ? "border-emerald-500 bg-emerald-900/30 text-emerald-300 shadow-lg shadow-emerald-500/10" :
                  "border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-800/80"}
                ${!isConnected || hasVoted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {/* Progress Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentages[idx]}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={`absolute left-0 top-0 h-full rounded-2xl z-0 ${isSelected ? "bg-emerald-500/20" : "bg-zinc-700/20"}`}
                style={{ pointerEvents: 'none' }}
              />
              <div className="relative z-10 flex-1 flex flex-col items-start">
                <span className="font-semibold text-lg">{opt.title}</span>
                <span className="text-xs mt-1 flex items-center gap-2">
                  {animateVote.trigger && animateVote.optionId === opt.id && userVote === opt.id
                    ? <CountUp start={0} end={optionVotes[idx]} duration={1.2} />
                    : optionVotes[idx]}
                  <span className="text-zinc-400">votes</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-zinc-800/60 text-emerald-300 font-semibold text-xs">
                    {percentages[idx]}%
                  </span>
                </span>
              </div>
              <div className="ml-4 flex items-center gap-2">
                {isSelected && !isVoting && <CheckCircle size={20} className="text-emerald-400" />}
                {isVoting && userVote === opt.id && <Loader2 size={20} className="animate-spin text-emerald-400" />}
              </div>
            </motion.button>
          );
        })}
      </div>
      {/* Optionally, add confetti animation here when a vote is cast */}

      {/* Actions: Comment, Share */}
      <div className="flex items-center gap-8 mt-2 text-zinc-500">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-sm hover:text-emerald-500 transition-colors"
        >
          <MessageCircle size={18} />
          <span>{post.comments}</span>
        </button>
        <button
          className="flex items-center gap-1 text-sm hover:text-blue-500 transition-colors"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>

      {/* Vote/Engagement Info */}
      <div className="flex items-center gap-4 text-xs text-zinc-400 mt-4">
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700 font-semibold">
          <Eye size={14} />
          {totalVotes} total votes
        </span>
        {hasVoted && (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-700 text-emerald-300 font-semibold">
            <CheckCircle size={14} className="text-emerald-400" />
            You voted
          </span>
        )}
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700">
          <TrendingUp size={14} />
          {totalVotes > 0 ? (100).toFixed(0) : 0}% engagement
        </span>
      </div>

      {/* Comments Section (minimal, hidden by default) */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-4"
          >
            <div className="space-y-4">
              {post.comments === 0 ? (
                <div className="text-center py-6">
                  <MessageCircle size={32} className="text-zinc-300 mx-auto mb-2" />
                  <p className="text-zinc-400 text-base font-medium">No comments yet</p>
                  <p className="text-zinc-400 text-xs">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <span className="text-xs font-bold text-zinc-700 dark:text-white">U</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-zinc-700 dark:text-zinc-200 leading-relaxed text-sm">
                      Great question! I think option A is better because...
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">2 hours ago</p>
                  </div>
                </div>
              )}
              <div className="flex space-x-3 mt-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-black">{user?.email?.charAt(0)?.toUpperCase() || "Y"}</span>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={user ? "Add a comment..." : "Login to comment"}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full px-4 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500/50 focus:bg-white dark:focus:bg-zinc-900 transition-all duration-200 text-sm"
                    disabled={!user}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
