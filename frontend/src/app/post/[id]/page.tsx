"use client";
import { useParams } from "next/navigation";

export default function PostPage() {
  const params = useParams();
  const postId = params.id;

  return (
    <div className="p-8">
      <h1>Post {postId}</h1>
      <p>This is a test page to verify the route is working.</p>
    </div>
  );
} 