export async function fetchPosts() {
  const res = await fetch("http://localhost:8000/api/post/v1/all", {
    next: { revalidate: 5 },
    cache: "reload",
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
} 