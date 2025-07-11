"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  MessageCircle, 
  Share2, 
  Clock, 
  TrendingUp, 
  Timer, 
  CheckCircle,
  Wifi,
  WifiOff,
  Loader2
} from "lucide-react";
import socket, { socketManager } from "@/lib/socket";
import { useSession } from "next-auth/react";

interface TimelinePostProps {
  post: {
    id: string;
    user: {
      name: string;
      username: string;
      avatar?: string;
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
    timeAgo: string;
    category?: string;
    expire_in?: string;
  };
  index: number;
}

export default function TimelinePost({ post, index }: TimelinePostProps) {
  const [userVote, setUserVote] = useState<"A" | "B" | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const {data:session} = useSession()

  const user = session?.user as {token?:string} | undefined
  
  // Local state for vote counts (will be updated via socket)
  const [localVotes, setLocalVotes] = useState({
    optionA: post.optionA.votes,
    optionB: post.optionB.votes,
    total: post.totalVotes
  });

  useEffect(() => {
    // Check initial connection status
    setIsConnected(socketManager.isConnected());

    // Socket event listeners
    const handleConnect = () => {
      console.log('🟢 Socket connected');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('🔴 Socket disconnected');
      setIsConnected(false);
    };

    const handleVoteUpdate = (data: any) => {
      console.log('📊 Vote update received:', data);
      
      // Check if this update is for the current post
      if (data.post_id === parseInt(post.id)) {
        // Handle your API structure where options come as array
        let newOptionAVotes = localVotes.optionA;
        let newOptionBVotes = localVotes.optionB;
        
        if (data.options && Array.isArray(data.options)) {
          // If backend sends options array
          const optionA = data.options.find((opt: any) => opt.id === parseInt(post.optionA.id));
          const optionB = data.options.find((opt: any) => opt.id === parseInt(post.optionB.id));
          
          newOptionAVotes = optionA ? optionA.count : localVotes.optionA;
          newOptionBVotes = optionB ? optionB.count : localVotes.optionB;
        } else {
          // Handle individual vote count updates
          newOptionAVotes = data.optionA_votes !== undefined ? data.optionA_votes : 
                           data.option_a_votes !== undefined ? data.option_a_votes : localVotes.optionA;
          newOptionBVotes = data.optionB_votes !== undefined ? data.optionB_votes : 
                           data.option_b_votes !== undefined ? data.option_b_votes : localVotes.optionB;
        }
        
        setLocalVotes({
          optionA: newOptionAVotes,
          optionB: newOptionBVotes,
          total: newOptionAVotes + newOptionBVotes
        });
        
        // Update user vote if provided
        if (data.user_vote) {
          setUserVote(data.user_vote);
        }
        
        setIsVoting(false);
      }
    };

    const handleVoteError = (error: any) => {
      console.error('❌ Vote error:', error);
      setIsVoting(false);
      // You could show a toast notification here
    };

    // Add event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(`vote-update-${post.id}`, handleVoteUpdate);
    socket.on('vote-update', handleVoteUpdate); // Fallback for general updates
    socket.on('vote-error', handleVoteError);

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(`vote-update-${post.id}`, handleVoteUpdate);
      socket.off('vote-update', handleVoteUpdate);
      socket.off('vote-error', handleVoteError);
    };
  }, [post.id, localVotes.optionA, localVotes.optionB]);

  const handleVote = async (option: "A" | "B") => {
    if (!isConnected) {
      console.warn('⚠️ Socket not connected');
      return;
    }

    if (isVoting) {
      console.warn('⚠️ Already voting...');
      return;
    }

    setIsVoting(true);
    
    const optionId = option === "A" ? post.optionA.id : post.optionB.id;
    
    // Optimistic update
    const previousVote = userVote;
    setUserVote(option);

    // Prepare vote data
    const voteData = {
      post_id: parseInt(post.id),
      option_id: optionId,
      option: option,
      user_id: user.id, // Replace with actual user ID
    };

    console.log('🗳️ Emitting vote:', voteData);

    try {
      // Emit vote to server
      socket.emit(`voting-${post.id}`, voteData);
      
      // Also try the general voting event as fallback
      socket.emit('vote', voteData);
      
      // Set a timeout to reset voting state if no response
      setTimeout(() => {
        if (isVoting) {
          console.warn('⏰ Vote timeout - resetting state');
          setIsVoting(false);
          setUserVote(previousVote); // Revert optimistic update
        }
      }, 5000);
      
    } catch (error) {
      console.error('❌ Error emitting vote:', error);
      setIsVoting(false);
      setUserVote(previousVote); // Revert optimistic update
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      tech: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      health: "bg-green-500/20 text-green-400 border-green-500/30",
      finance: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      lifestyle: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      career: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      travel: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      default: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    };
    return colors[category?.toLowerCase() as keyof typeof colors] || colors.default;
  };

  // Calculate percentages
  const totalVotes = localVotes.total || 1; // Avoid division by zero
  const optionAPercentage = Math.round((localVotes.optionA / totalVotes) * 100);
  const optionBPercentage = Math.round((localVotes.optionB / totalVotes) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 shadow-xl hover:border-zinc-700 transition-all duration-300"
    >
      {/* Connection Status Indicator */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        {isConnected ? (
          <div className="flex items-center space-x-1 text-green-400">
            <Wifi size={14} />
            <span className="text-xs">Live</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-red-400">
            <WifiOff size={14} />
            <span className="text-xs">Offline</span>
          </div>
        )}
      </div>

      {/* Post Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <span className="text-lg font-bold text-black">
              {post.user.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{post.user.name}</h3>
            <p className="text-sm text-emerald-400">{post.user.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-zinc-400">
          <div className="flex items-center space-x-2">
            <Clock size={16} />
            <span className="text-sm">{post.timeAgo}</span>
          </div>
          {post.expire_in && (
            <div className="flex items-center space-x-2 text-orange-400">
              <Timer size={16} />
              <span className="text-sm">Expires in {post.expire_in}</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Badge */}
      {post.category && (
        <div className="mb-4">
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
        </div>
      )}

      {/* Post Content */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
        {post.description && (
          <p className="text-zinc-300 leading-relaxed">{post.description}</p>
        )}
      </div>

      {/* Voting Options */}
      <div className="mb-6 space-y-4">
        {/* Option A */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleVote("A")}
          className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
            userVote === "A"
              ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20"
              : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800/70"
          } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white">{post.optionA.title}</h4>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">{optionAPercentage}%</span>
              {userVote === "A" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-emerald-400"
                >
                  <CheckCircle size={16} />
                </motion.div>
              )}
              {isVoting && userVote === "A" && (
                <Loader2 size={16} className="animate-spin text-emerald-400" />
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-zinc-700/50 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${optionAPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <p className="text-zinc-300">{post.optionA.description}</p>
            <span className="text-emerald-400 font-medium">
              {localVotes.optionA.toLocaleString()} votes
            </span>
          </div>
        </motion.div>

        {/* Option B */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleVote("B")}
          className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
            userVote === "B"
              ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
              : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800/70"
          } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white">{post.optionB.title}</h4>
            <div className="flex items-center space-x-2">
              <span className="text-blue-400 font-bold">{optionBPercentage}%</span>
              {userVote === "B" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-blue-400"
                >
                  <CheckCircle size={16} />
                </motion.div>
              )}
              {isVoting && userVote === "B" && (
                <Loader2 size={16} className="animate-spin text-blue-400" />
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-zinc-700/50 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${optionBPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <p className="text-zinc-300">{post.optionB.description}</p>
            <span className="text-blue-400 font-medium">
              {localVotes.optionB.toLocaleString()} votes
            </span>
          </div>
        </motion.div>
      </div>

      {/* Vote Summary */}
      <div className="mb-4 text-center">
        <p className="text-sm text-zinc-500">
          {localVotes.total.toLocaleString()} total votes
        </p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
        <div className="flex items-center space-x-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <MessageCircle size={18} />
            <span className="text-sm">{post.comments}</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <Share2 size={18} />
            <span className="text-sm">Share</span>
          </motion.button>
        </div>

        <div className="flex items-center space-x-2 text-zinc-400">
          <TrendingUp size={16} />
          <span className="text-sm">
            {((localVotes.optionA + localVotes.optionB) / Math.max(localVotes.total, 1) * 100).toFixed(0)}% participation
          </span>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border-t border-zinc-800 pt-4"
          >
            <div className="space-y-3">
              {post.comments === 0 ? (
                <div className="text-center py-4">
                  <p className="text-zinc-400 text-sm">No comments yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">U</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-300">Great question! I think option A is better because...</p>
                    <p className="text-xs text-zinc-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              )}
              
              {/* Comment Input */}
              <div className="flex space-x-3 mt-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <span className="text-sm font-bold text-black">Y</span>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-400 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}