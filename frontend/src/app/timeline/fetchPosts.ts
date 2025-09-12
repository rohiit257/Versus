import { BACKEND_URL } from "@/lib/apiEndPoints";

export async function fetchPosts() {
  const res = await fetch(`${BACKEND_URL}/api/post/v1/all`, {
    next: { revalidate: 5 },
    cache: "reload",
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
} 