"use client";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  user: customUser;
}

const MAX_OPTIONS = 5;
const MIN_OPTIONS = 2;

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
          setOptions(res.data.data.Option.map((o: Option) => o.option));
        }
      } catch (err: any) {
        setError(`Failed to fetch post: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    }
    if (user?.token && postId) fetchPost();
  }, [postId, user]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div></div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!post) return <div className="p-8 text-center">Post not found</div>;
  if (post.user.id !== user?.id) return <div className="p-8 text-center text-zinc-400">Only the post owner can manage options.</div>;

  const canAddMore = options.length < MAX_OPTIONS && post.Option.length < MAX_OPTIONS;
  const canSubmit = options.filter(opt => opt.trim()).length >= MIN_OPTIONS && !submitting;

  const handleOptionChange = (idx: number, value: string) => {
    setOptions(prev => prev.map((opt, i) => (i === idx ? value : opt)));
  };

  const handleAddOptionField = () => {
    if (options.length < MAX_OPTIONS) setOptions(prev => [...prev, ""]);
  };

  const handleRemoveOptionField = (idx: number) => {
    if (options.length > MIN_OPTIONS) setOptions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddOptions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Only send new options (not already in post.Option)
      const newOptions = options.filter(opt => opt.trim()).slice(post.Option.length);
      for (const opt of newOptions) {
        await axios.post(
          "http://localhost:8000/api/post/v1/add-options",
          {
            post_id: postId,
            option1: opt,
            option2: "", // API expects two, but we send one at a time for scalability
          },
          {
            headers: { Authorization: user?.token },
          }
        );
      }
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
    <div className="max-w-xl mx-auto p-4 sm:p-8">
      {/* Card-like post header */}
      <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 shadow-lg border border-zinc-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-black font-bold text-xl shadow-lg">
            {post.user.name[0]}
          </div>
          <div>
            <div className="font-bold text-lg text-white">{post.user.name}</div>
            <div className="text-xs text-zinc-400">@{post.user.email.split("@")[0]}</div>
          </div>
        </div>
        <div className="font-semibold text-xl text-emerald-400 mb-1">{post.title}</div>
        <div className="text-zinc-300 mb-2">{post.description}</div>
        <div className="text-xs text-zinc-500">Category: {post.category}</div>
      </div>
      {/* Options List */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2 text-white">Current Options:</h2>
        {post.Option.length === 0 && <div className="text-zinc-400">No options yet.</div>}
        <ul className="flex flex-col gap-2">
          {post.Option.map((opt) => (
            <li key={opt.id} className="rounded-lg bg-zinc-800 px-4 py-2 text-zinc-200 border border-zinc-700 flex items-center gap-2">
              <span className="font-medium">{opt.option}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Add Options Form */}
      {post.Option.length < MAX_OPTIONS && (
        <form onSubmit={handleAddOptions} className="space-y-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
          <div className="flex flex-col gap-3">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={opt}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-emerald-500 outline-none"
                  required={idx < MIN_OPTIONS}
                  maxLength={100}
                  disabled={submitting}
                />
                {options.length > MIN_OPTIONS && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOptionField(idx)}
                    className="text-zinc-500 hover:text-red-500 px-2 py-1 rounded"
                    disabled={submitting}
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            {canAddMore && (
              <button
                type="button"
                onClick={handleAddOptionField}
                className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 text-black font-semibold hover:from-emerald-400 hover:to-blue-400 transition-all"
                disabled={submitting}
              >
                + Add Option
              </button>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-black font-bold text-lg shadow-lg hover:from-emerald-400 hover:to-blue-400 transition-all flex items-center justify-center gap-2"
            disabled={!canSubmit}
          >
            {submitting && <span className="animate-spin h-5 w-5 border-b-2 border-black"></span>}
            {submitting ? "Adding..." : "Add Options"}
          </button>
        </form>
      )}
    </div>
  );
} 