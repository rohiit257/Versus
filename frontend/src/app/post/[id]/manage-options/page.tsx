"use client";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  user: customUser;
}

const MAX_OPTIONS = 2; // Fixed to only 2 options

export default function ManageOptionsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const postId = params.id;
  const user = session?.user as customUser | undefined;

  const [post, setPost] = useState<Post | null>(null);
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`http://localhost:8000/api/post/v1/${postId}`, {
          headers: { Authorization: user?.token },
        });
        setPost(res.data.data);
        // If post already has options, fill them in
        if (res.data.data.Option?.length > 0) {
          const existingOptions = res.data.data.Option.map((o: Option) => o.option);
          setOptions([...existingOptions, ...Array(2 - existingOptions.length).fill("")]);
        }
      } catch (err: any) {
        setError(`Failed to fetch post: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    }
    if (user?.token && postId) fetchPost();
  }, [postId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <SidebarClient user={user} />
        <div className="ml-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <SidebarClient user={user} />
        <div className="ml-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black">
        <SidebarClient user={user} />
        <div className="ml-20 flex items-center justify-center min-h-screen">
          <div className="text-center text-white">Post not found</div>
        </div>
      </div>
    );
  }

  if (post.user.id !== user?.id) {
    return (
      <div className="min-h-screen bg-black">
        <SidebarClient user={user} />
        <div className="ml-20 flex items-center justify-center min-h-screen">
          <div className="text-center text-zinc-400">Only the post owner can manage options.</div>
        </div>
      </div>
    );
  }

  const canSubmit = options.filter(opt => opt.trim()).length === MAX_OPTIONS && !submitting;

  const handleOptionChange = (idx: number, value: string) => {
    setOptions(prev => prev.map((opt, i) => (i === idx ? value : opt)));
  };

  const handleAddOptions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const validOptions = options.filter(opt => opt.trim());
      if (validOptions.length !== 2) {
        throw new Error("Exactly 2 options are required");
      }

      await axios.post(
        "http://localhost:8000/api/post/v1/add-options",
        {
          post_id: postId,
          option1: validOptions[0],
          option2: validOptions[1],
        },
        {
          headers: { Authorization: user?.token },
        }
      );

      // Refetch post/options
      const res = await axios.get(`http://localhost:8000/api/post/v1/${postId}`, {
        headers: { Authorization: user?.token },
      });
      setPost(res.data.data);
      setOptions(res.data.data.Option.map((o: Option) => o.option));
    } catch (err: any) {
      setError(`Failed to add options: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <SidebarClient user={user} />
      
      <div className="ml-20 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Manage Options</h1>
            <p className="text-zinc-400">Add exactly 2 options to your post</p>
          </div>

          {/* Post Preview */}
          <div className="mb-8 p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold">
                {post.user.name[0]}
              </div>
              <div>
                <div className="font-semibold text-white">{post.user.name}</div>
                <div className="text-xs text-zinc-400">@{post.user.email.split("@")[0]}</div>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">{post.title}</h2>
            <p className="text-zinc-300 text-sm mb-2">{post.description}</p>
            <span className="inline-block px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs">
              {post.category}
            </span>
          </div>

          {/* Current Options */}
          {post.Option.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Current Options</h3>
              <div className="space-y-3">
                {post.Option.map((opt) => (
                  <div key={opt.id} className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-white font-medium">{opt.option}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Options Form */}
          {post.Option.length < MAX_OPTIONS && (
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <h3 className="text-lg font-semibold text-white mb-4">Add Options</h3>
              <form onSubmit={handleAddOptions} className="space-y-4">
                {options.map((opt, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Option {idx + 1}
                    </label>
                    <input
                      value={opt}
                      onChange={e => handleOptionChange(idx, e.target.value)}
                      placeholder={`Enter option ${idx + 1}`}
                      className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors"
                      required
                      maxLength={100}
                      disabled={submitting}
                    />
                  </div>
                ))}
                
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full py-3 px-4 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-b-2 border-black"></div>
                      Adding Options...
                    </>
                  ) : (
                    "Add Options"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Success State */}
          {post.Option.length >= MAX_OPTIONS && (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Options Complete</h3>
              <p className="text-zinc-400">Your post is ready for voting!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 