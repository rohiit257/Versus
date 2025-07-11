import { fetchPosts } from "./fetchPosts";
import EnhancedTimeline from "./page";

export default async function TimelineServer() {
  const data = await fetchPosts();
  return <EnhancedTimeline initialData={data} />;
} 