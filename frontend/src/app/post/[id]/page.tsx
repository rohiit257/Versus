"use client";
import { useParams } from "next/navigation";

export default function PostPage() {
  const params = useParams();
  const postId = params.id;

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-foreground">Post {postId}</h1>
      <p className="text-muted-foreground">This is a test page to verify the route is working.</p>
    </div>
  );
} 