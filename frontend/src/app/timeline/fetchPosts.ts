export async function fetchPosts() {
  const res = await fetch("https://versus-server-latest.onrender.com/api/post/v1/all", {
    next: { revalidate: 5 },
    cache: "reload",
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
} 