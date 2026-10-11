import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/PostEditor";
import { lastPairing } from "@/lib/editor";

export const metadata: Metadata = { title: "New issue" };

export default function NewPostPage() {
  return <PostEditor post={null} defaultPairing={lastPairing()} />;
}
