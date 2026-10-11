import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { postById } from "@/lib/posts";

export const metadata: Metadata = { title: "Edit issue" };

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const post = postById(parseInt(id, 10));
  if (!post) notFound();
  return <PostEditor post={post} justCreated={saved === "1"} />;
}
