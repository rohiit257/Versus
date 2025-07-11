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
  Send,
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
    commentsList: Comment[]
    likes: number
    timeAgo: string
    category?: string
    expiresAt: string
    isHot?: boolean
    isTrending?: boolean
  }
  index: number
}

interface Comment {
  id: number
  content: string
  created_at: string
  user?: {
    id: number
    name: string
    email: string
  }
}

export default function EnhancedTimelinePost({ post, index }: TimelinePostProps) {
  const [userVote, setUserVote] = useState<string | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [voteTimeout, setVoteTimeout] = useState<NodeJS.Timeout | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [showActions, setShowActions] = useState(false)

  // Comment states
  const [comments, setComments] = useState<Comment[]>(post.commentsList || [])
  const [newComment, setNewComment] = useState("")
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentTimeout, setCommentTimeout] = useState<NodeJS.Timeout | null>(null)

  const { data: session } = useSession()
  const user = session?.user as { token?: string; id?: string; email?: string; name?: string } | undefined

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
    
    // Vote event handlers
    const handleVoteUpdate = (data: any) => {
      console.log("Vote update received:", data);
      if (data.post_id === Number.parseInt(post.id)) {
        console.log("Processing vote update for this post");
        if (data.options && Array.isArray(data.options)) {
          const newVotes = post.options.map(opt => {
            const updated = data.options.find((o: any) => o.id === Number(opt.id));
            return updated ? updated.count : opt.votes;
          });
          console.log("Updated votes:", newVotes);
          setOptionVotes(newVotes);
          setTotalVotes(newVotes.reduce((sum, v) => sum + v, 0));
        }
        if (data.user_vote && data.user_id === (user?.id || user?.email)) {
          console.log("User vote confirmed:", data.user_vote);
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
      console.log("Vote success received:", data);
      if (data.post_id === Number.parseInt(post.id) && data.user_id === (user?.id || user?.email)) {
        console.log("Processing vote success for this user");
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
      console.error("Vote error received:", error);
      setIsVoting(false)
      setUserVote(null)
      setHasVoted(false)

      if (voteTimeout) {
        clearTimeout(voteTimeout)
        setVoteTimeout(null)
      }
    }

    // Comment event handlers
    const handleCommentUpdate = (data: any) => {
      console.log("Comment update received:", data);
      if (data.post_id === Number.parseInt(post.id)) {
        console.log("Processing comment update for this post");
        // Ensure comments have proper user data structure
        const processedComments = (data.comments || []).map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user: comment.user ? {
            id: comment.user.id,
            name: comment.user.name,
            email: comment.user.email
          } : null
        }));
        setComments(processedComments);
        setIsCommenting(false);
        if (commentTimeout) {
          clearTimeout(commentTimeout);
          setCommentTimeout(null);
        }
      }
    };

    const handleCommentSuccess = (data: any) => {
      console.log("Comment success received:", data);
      if (data.post_id === Number.parseInt(post.id) && data.user_id === (user?.id || user?.email)) {
        console.log("Processing comment success for this user");
        setIsCommenting(false);
        setNewComment("");
        if (commentTimeout) {
          clearTimeout(commentTimeout);
          setCommentTimeout(null);
        }
      }
    };

    const handleCommentError = (error: any) => {
      console.error("Comment error received:", error);
      setIsCommenting(false);
      setNewComment("");
      if (commentTimeout) {
        clearTimeout(commentTimeout);
        setCommentTimeout(null);
      }
    };

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    
    // Vote events
    socket.on(`vote-update-${post.id}`, handleVoteUpdate)
    socket.on("vote-update", handleVoteUpdate)
    socket.on("vote-success", handleVoteSuccess)
    socket.on("vote-error", handleVoteError)
    
    // Comment events
    socket.on(`comment-update-${post.id}`, handleCommentUpdate)
    socket.on("comment-update", handleCommentUpdate)
    socket.on("comment-success", handleCommentSuccess)
    socket.on("comment-error", handleCommentError)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      
      // Vote events
      socket.off(`vote-update-${post.id}`, handleVoteUpdate)
      socket.off("vote-update", handleVoteUpdate)
      socket.off("vote-success", handleVoteSuccess)
      socket.off("vote-error", handleVoteError)
      
      // Comment events
      socket.off(`comment-update-${post.id}`, handleCommentUpdate)
      socket.off("comment-update", handleCommentUpdate)
      socket.off("comment-success", handleCommentSuccess)
      socket.off("comment-error", handleCommentError)

      if (voteTimeout) {
        clearTimeout(voteTimeout)
      }
      if (commentTimeout) {
        clearTimeout(commentTimeout)
      }
    }
  }, [post.id, voteTimeout, commentTimeout, user?.id, user?.email])

  if (!post.options || post.options.length < 2) {
    return null;
  }

  const handleVote = async (optionId: string) => {
    if (!isConnected || isVoting || hasVoted || !user) {
      console.log("Vote blocked:", { isConnected, isVoting, hasVoted, user: !!user });
      return;
    }
    
    console.log("Starting vote for option:", optionId);
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
    
    console.log("Sending vote data:", voteData);
    
    try {
      socket.emit("vote", voteData);
      console.log("Vote emitted to socket");
      
      const timeout = setTimeout(() => {
        console.log("Vote timeout - resetting state");
        setIsVoting(false);
        setUserVote(null);
        setVoteTimeout(null);
      }, 5000);
      setVoteTimeout(timeout);
    } catch (error) {
      console.error("Error emitting vote:", error);
      setIsVoting(false);
      setUserVote(null);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || isCommenting || !user || !newComment.trim()) {
      console.log("Comment blocked:", { isConnected, isCommenting, user: !!user, hasComment: !!newComment.trim() });
      return;
    }
    
    console.log("Starting comment submission");
    setIsCommenting(true);
    
    const commentData = {
      post_id: Number.parseInt(post.id),
      content: newComment.trim(),
      user_id: user.id || user.email || "anonymous",
      user_token: user.token,
      timestamp: new Date().toISOString(),
    };
    
    console.log("Sending comment data:", commentData);
    
    try {
      socket.emit("comment", commentData);
      console.log("Comment emitted to socket");
      
      const timeout = setTimeout(() => {
        console.log("Comment timeout - resetting state");
        setIsCommenting(false);
        setNewComment("");
        setCommentTimeout(null);
      }, 5000);
      setCommentTimeout(timeout);
    } catch (error) {
      console.error("Error emitting comment:", error);
      setIsCommenting(false);
      setNewComment("");
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
      className="relative bg-black border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors duration-200 cursor-pointer"
    >
      {/* Post Container */}
      <div className="px-4 py-3">
        {/* Header: Avatar, Name, Username, Verified, Time, More Options */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-lg font-bold text-white">
            {post.user.avatar ? (
              <img src={post.user.avatar} alt={post.user.name} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              post.user.name.charAt(0)
            )}
          </div>
          
          {/* User Info and Content */}
          <div className="flex-1 min-w-0">
            {/* User Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-white text-base">{post.user.name}</span>
              {post.user.verified && <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />}
              <span className="text-zinc-500 text-sm">@{post.user.username}</span>
              <span className="text-zinc-500 text-sm">·</span>
              <span className="text-zinc-500 text-sm">{post.timeAgo}</span>
              {post.category && (
                <>
                  <span className="text-zinc-500 text-sm">·</span>
                  <span className="text-emerald-500 text-sm font-medium">{post.category}</span>
                </>
              )}
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <h2 className="text-white text-base leading-6 mb-2 font-normal">{post.title}</h2>
              {post.description && (
                <p className="text-zinc-300 text-base leading-6">{post.description}</p>
              )}
            </div>

            {/* Voting Options */}
            <div className="space-y-2 mb-4">
              {post.options.map((opt, idx) => {
                const isSelected = userVote === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: !hasVoted && isConnected ? 1.01 : 1 }}
                    whileTap={{ scale: !hasVoted && isConnected ? 0.99 : 1 }}
                    onClick={() => !hasVoted && isConnected && handleVote(opt.id)}
                    disabled={!isConnected || hasVoted || isVoting}
                    className={`relative w-full text-left p-3 rounded-xl border transition-all duration-200 overflow-hidden
                      ${isSelected 
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300" 
                        : "border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700/50"
                      }
                      ${!isConnected || hasVoted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {/* Progress Bar */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentages[idx]}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className={`absolute left-0 top-0 h-full rounded-xl z-0 ${
                        isSelected ? "bg-emerald-500/20" : "bg-zinc-600/30"
                      }`}
                      style={{ pointerEvents: 'none' }}
                    />
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex-1">
                        <span className="font-medium text-sm block">{opt.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-zinc-400">
                            {animateVote.trigger && animateVote.optionId === opt.id && userVote === opt.id
                              ? <CountUp start={0} end={optionVotes[idx]} duration={1.2} />
                              : optionVotes[idx]
                            } votes
                          </span>
                          <span className="text-xs text-emerald-400 font-medium">
                            {percentages[idx]}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isSelected && !isVoting && <CheckCircle size={16} className="text-emerald-400" />}
                        {isVoting && userVote === opt.id && <Loader2 size={16} className="animate-spin text-emerald-400" />}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between text-zinc-500">
              <div className="flex items-center gap-8">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-2 text-sm hover:text-emerald-500 transition-colors group"
                >
                  <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                  <span>{comments.length || post.comments}</span>
                </button>
                
                <button className="flex items-center gap-2 text-sm hover:text-emerald-500 transition-colors group">
                  <Share2 size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Share</span>
                </button>
              </div>
              
              {/* Vote Status */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-400">
                  {totalVotes} votes
                </span>
                {hasVoted && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                    <CheckCircle size={12} />
                    Voted
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* More Options Button */}
          <button className="flex-shrink-0 p-1 rounded-full hover:bg-zinc-800 transition-colors">
            <MoreHorizontal size={16} className="text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-zinc-800 bg-zinc-900/30"
          >
            <div className="p-4 space-y-4">
              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="text-center py-6">
                  <MessageCircle size={24} className="text-zinc-500 mx-auto mb-2" />
                  <p className="text-zinc-400 text-sm">No comments yet</p>
                  <p className="text-zinc-500 text-xs">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                          {comment.user?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {comment.user?.name || "Anonymous"}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-zinc-200 text-sm leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Comment Input */}
              <form onSubmit={handleComment} className="flex gap-3 pt-2">
                <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-black">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "Y"}
                  </span>
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? "Add a comment..." : "Login to comment"}
                    className="flex-1 bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-500 text-sm"
                    disabled={!user || isCommenting}
                  />
                  {user && newComment.trim() && (
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isCommenting}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCommenting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                    </motion.button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
