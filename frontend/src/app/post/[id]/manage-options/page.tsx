"use client";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import SidebarClient from "@/components/base/navbar/SidebarClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";

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
  const router = useRouter();
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

  // --- UI/UX: Animated loading spinner ---
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SidebarClient user={user} />
        <div className="flex-1 flex flex-col items-center justify-center ml-0 lg:ml-64 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="animate-spin h-12 w-12 text-emerald-500" />
            <span className="text-lg text-muted-foreground">Loading...</span>
          </motion.div>
        </div>
      </div>
    );
  }

  // --- UI/UX: Animated error alert ---
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SidebarClient user={user} />
        <div className="flex-1 flex flex-col items-center justify-center ml-0 lg:ml-64 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-6 rounded-xl shadow max-w-md w-full text-center mb-6"
          >
            <div className="text-lg mb-4">{error}</div>
            <Button onClick={() => window.history.back()} variant="outline" className="w-full flex items-center justify-center gap-2">
              <ArrowLeft size={18} /> Go Back
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SidebarClient user={user} />
        <div className="flex-1 flex flex-col items-center justify-center ml-0 lg:ml-64 p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-foreground text-lg">Post not found</motion.div>
        </div>
      </div>
    );
  }

  if (post.user.id !== user?.id) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SidebarClient user={user} />
        <div className="flex-1 flex flex-col items-center justify-center ml-0 lg:ml-64 p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground text-lg">Only the post owner can manage options.</motion.div>
        </div>
      </div>
    );
  }

  // --- UI/UX: Option input with char counter, duplicate prevention, reset ---
  const canSubmit =
    options.filter((opt) => opt.trim()).length === MAX_OPTIONS &&
    !submitting &&
    new Set(options.map((o) => o.trim().toLowerCase())).size === options.length;

  const handleOptionChange = (idx: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === idx ? value : opt)));
  };

  const handleReset = () => {
    setOptions(["", ""]);
    toast("Form reset");
  };

  const handleAddOptions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please fill in two unique options.");
      return;
    }
    setSubmitting(true);
    try {
      const validOptions = options.map((opt) => opt.trim());
      if (validOptions.length !== 2 || new Set(validOptions.map((o) => o.toLowerCase())).size !== 2) {
        throw new Error("Exactly 2 unique options are required");
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
      toast.success("Options added successfully!");
      // Refetch post/options
      const res = await axios.get(`http://localhost:8000/api/post/v1/${postId}`, {
        headers: { Authorization: user?.token },
      });
      setPost(res.data.data);
      setOptions(res.data.data.Option.map((o: Option) => o.option));
    } catch (err: any) {
      toast.error(`Failed to add options: ${err.response?.data?.message || err.message}`);
      setError(`Failed to add options: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // --- UI/UX: Responsive, animated, modern layout ---
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SidebarClient user={user} />
      <main className="flex-1 flex flex-col items-center justify-start ml-0 lg:ml-64 p-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl mt-8"
        >
          {/* Back Button */}
          <Button
            variant="outline"
            className="mb-6 flex items-center gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} /> Back to Post
          </Button>

          {/* Header */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground mb-2">Manage Options</CardTitle>
              <CardDescription>Add exactly 2 options to your post</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Post Preview */}
              <div className="mb-8 p-6 rounded-xl bg-card border border-border flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-xl">
                  {post.user.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{post.user.name}</div>
                  <div className="text-xs text-muted-foreground">@{post.user.email.split("@")[0]}</div>
                  <h2 className="text-lg font-semibold text-foreground mt-2">{post.title}</h2>
                  <p className="text-muted-foreground text-sm mb-2">{post.description}</p>
                  <span className="inline-block px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Current Options */}
              {post.Option.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Current Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {post.Option.map((opt) => (
                      <motion.div
                        key={opt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 rounded-lg bg-card border border-border shadow"
                      >
                        <span className="text-foreground font-medium">{opt.option}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Options Form */}
              {post.Option.length < MAX_OPTIONS && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-card p-6 rounded-xl border border-border shadow"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Add Options</h3>
                  <form onSubmit={handleAddOptions} className="space-y-4">
                    {options.map((opt, idx) => {
                      const isDuplicate =
                        options.filter((o, i) => o.trim().toLowerCase() === opt.trim().toLowerCase() && i !== idx).length > 0;
                      return (
                        <div key={idx} className="relative">
                          <label className="block text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                            Option {idx + 1}
                            <span className="ml-2 text-xs text-muted-foreground">(max 100 chars)</span>
                          </label>
                          <Input
                            value={opt}
                            onChange={e => handleOptionChange(idx, e.target.value)}
                            placeholder={`Enter option ${idx + 1}`}
                            maxLength={100}
                            required
                            disabled={submitting}
                            className={`pr-16 ${isDuplicate ? 'border-red-500' : ''}`}
                          />
                          {/* Char counter */}
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            {opt.length}/100
                          </span>
                          {/* Duplicate warning */}
                          {isDuplicate && (
                            <span className="absolute left-0 -bottom-5 text-xs text-red-500">Duplicate option</span>
                          )}
                        </div>
                      );
                    })}
                    <div className="flex flex-col md:flex-row gap-3 mt-4">
                      <motion.button
                        type="submit"
                        disabled={!canSubmit}
                        whileHover={{ scale: canSubmit ? 1.02 : 1 }}
                        whileTap={{ scale: canSubmit ? 0.98 : 1 }}
                        className="w-full md:w-auto py-3 px-4 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                          "Add Options"
                        )}
                      </motion.button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={submitting}
                        className="w-full md:w-auto"
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Success State */}
              {post.Option.length >= MAX_OPTIONS && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-center py-8"
                >
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Options Complete</h3>
                  <p className="text-muted-foreground">Your post is ready for voting!</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
} 