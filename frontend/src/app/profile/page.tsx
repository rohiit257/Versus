"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

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

  if (!user) return <div className="p-8 text-center">Please log in to view your profile.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Profile Header */}
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 shadow-2xl border border-zinc-800">
          <div className="flex items-center gap-6 mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 flex items-center justify-center text-black font-bold text-2xl shadow-xl">
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
              <p className="text-zinc-400 mb-2">@{user.email.split("@")[0]}</p>
              <p className="text-sm text-zinc-500">User ID: {user.id}</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{posts.length}</div>
              <div className="text-xs text-zinc-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {posts.reduce((sum, post) => sum + (post.Option?.length ?? 0), 0)}
              </div>
              <div className="text-xs text-zinc-500">Options</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {posts.filter(post => (post.Option?.length ?? 0) >= 2).length}
              </div>
              <div className="text-xs text-zinc-500">Active</div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Your Posts</h2>
            {loading && (
              <div className="flex items-center gap-2 text-zinc-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500/10 to-blue-500/10 flex items-center justify-center border border-emerald-500/20">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-300 mb-2">No posts yet</h3>
              <p className="text-zinc-500">Create your first post to get started!</p>
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/post/${post.id}/manage-options`}
                  className="block group"
                >
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 shadow-lg hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-emerald-400 mb-1 group-hover:text-emerald-300 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-zinc-300 text-sm line-clamp-2 mb-2">
                          {post.description}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          {post.Option?.length ?? 0} options
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          {post.Option?.length ?? 0 >= 2 ? "Active" : "Incomplete"}
                        </span>
                      </div>
                      <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
                        →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 