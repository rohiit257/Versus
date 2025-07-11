"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import SidebarClient from "@/components/base/navbar/SidebarClient";

// Types
interface customUser {
  id: string;
  name: string;
  email: string;
  token: string;
}
interface Option { id: number; option: string; }
interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  Option: Option[];
  user_id: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as customUser | undefined;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUserPosts() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("http://localhost:8000/api/post/v1", {
          headers: { Authorization: user?.token },
        });
        setPosts(res.data.data || []);
      } catch (err) {
        setError("Failed to fetch your posts");
      } finally {
        setLoading(false);
      }
    }
    if (user?.token) fetchUserPosts();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        <SidebarClient user={user} />
        <div className="ml-20 flex items-center justify-center min-h-screen">
          <div className="text-center text-white">Please log in to view your profile.</div>
        </div>
      </div>
    );
  }

  // Separate posts into pending and active
  const pendingPosts = posts.filter(post => (post.Option?.length ?? 0) < 2);
  const activePosts = posts.filter(post => (post.Option?.length ?? 0) >= 2);

  return (
    <div className="min-h-screen bg-black">
      <SidebarClient user={user} />
      
      <div className="ml-20 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="mb-8 p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-xl">
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{user.name}</h1>
                <p className="text-zinc-400">@{user.email.split("@")[0]}</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-zinc-800">
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-400">{posts.length}</div>
                <div className="text-xs text-zinc-500">Total Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">{activePosts.length}</div>
                <div className="text-xs text-zinc-500">Active Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-400">{pendingPosts.length}</div>
                <div className="text-xs text-zinc-500">Pending Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">
                  {posts.reduce((sum, post) => sum + (post.Option?.length ?? 0), 0)}
                </div>
                <div className="text-xs text-zinc-500">Total Options</div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-zinc-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                <span>Loading your posts...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">No posts yet</h3>
              <p className="text-zinc-500 mb-4">Create your first post to get started!</p>
              <Link 
                href="/timeline"
                className="inline-block px-4 py-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors"
              >
                Create Post
              </Link>
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className="space-y-8">
              {/* Pending Posts Section */}
              {pendingPosts.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-lg font-semibold text-white">Pending Posts</h2>
                    <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                      {pendingPosts.length}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-4">Posts that need options to be added</p>
                  
                  <div className="space-y-3">
                    {pendingPosts.map((post) => (
                      <Link 
                        key={post.id} 
                        href={`/post/${post.id}/manage-options`}
                        className="block group"
                      >
                        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-all duration-200 group-hover:bg-zinc-800/50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-1 group-hover:text-orange-300 transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-zinc-400 text-sm line-clamp-2 mb-2">
                                {post.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
                                  {post.category}
                                </span>
                                <span className="text-orange-400">
                                  {post.Option?.length ?? 0}/2 options
                                </span>
                              </div>
                            </div>
                            <div className="ml-4 flex items-center gap-2">
                              <span className="text-orange-400 group-hover:text-orange-300 transition-colors">
                                Add Options →
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Posts Section */}
              {activePosts.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-lg font-semibold text-white">Active Posts</h2>
                    <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                      {activePosts.length}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-4">Posts ready for voting</p>
                  
                  <div className="space-y-3">
                    {activePosts.map((post) => (
                      <Link 
                        key={post.id} 
                        href={`/post/${post.id}/manage-options`}
                        className="block group"
                      >
                        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-200 group-hover:bg-zinc-800/50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-zinc-400 text-sm line-clamp-2 mb-2">
                                {post.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
                                  {post.category}
                                </span>
                                <span className="text-emerald-400">
                                  {post.Option?.length ?? 0} options
                                </span>
                                <span className="text-emerald-400">✓ Ready</span>
                              </div>
                            </div>
                            <div className="ml-4 flex items-center gap-2">
                              <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors">
                                View →
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 