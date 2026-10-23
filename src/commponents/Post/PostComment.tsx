
import { ImagePlus, Send, X } from "lucide-react";
import {  useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { createPostComment } from "../../Services/comments.serveces";
import { useUserContext } from "../context/UserContex";

type Props = {
  postId: string;
  getComments: (postId: string) => void | Promise<void>;
};

export default function PostComment({
  postId,
  getComments,
}: Props) {
 const { userDetails } = useUserContext();
  const queryClient = useQueryClient();

  const inputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }

    const preview = URL.createObjectURL(image);
    setImagePreview(preview);

    return () => URL.revokeObjectURL(preview);
  }, [image]);

  function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file) {
      setImage(file);
    }

    e.target.value = "";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading || (!content.trim() && !image)) {
      return;
    }

    const formData = new FormData();

    if (content.trim()) {
      formData.append("content", content.trim());
    }

    if (image) {
      formData.append("image", image);
    }

    setIsLoading(true);

    try {
      const { data } = await createPostComment(postId, formData);

      toast.success(data?.message || "Comment added");

      setContent("");
      setImage(null);

      await getComments(postId);

      await queryClient.invalidateQueries({
        queryKey: ["getFeed"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["collectionPosts"],
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Couldn't add comment"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2.5">
          <img
            alt="Your profile"
            className="size-9 shrink-0 rounded-full object-cover"
            src={
              userDetails?.photo ||
              "https://route-posts.routemisr.com/default-profile.png"
            }
          />

          <div className="flex min-w-0 flex-1 items-center rounded-full bg-gray-100 pr-1.5 focus-within:ring-2 focus-within:ring-blue-200">
            <input
              ref={inputRef}
              className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-500"
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
            />

            <label className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-blue-700 transition hover:bg-blue-100">
              <span className="sr-only">Add an image</span>

              <input
                accept="image/*"
                className="sr-only"
                type="file"
                onChange={handleImage}
                disabled={isLoading}
              />

              <ImagePlus size={17} />
            </label>

            <button
              aria-label="Post comment"
              id={`post-comment-${postId}`}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:text-gray-400"
              type="submit"
              disabled={
                isLoading || (!content.trim() && !image)
                
              }
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      </form>

      {imagePreview && (
        <div className="relative ml-11 mt-3 w-fit">
          <img
            src={imagePreview}
            alt="Comment attachment preview"
            className="h-36 w-36 rounded-xl object-cover"
          />

          <button
            type="button"
            onClick={() => setImage(null)}
            className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-gray-900 text-white shadow"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {isLoading && (
        <p className="ml-11 mt-2 text-xs text-gray-500">
          Posting comment...
        </p>
      )}
    </div>
  );
}
