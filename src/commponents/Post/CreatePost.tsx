import {
  ChevronDown,
  Globe,
  Lock,
  ImageIcon,
  Send,
  Smile,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { useQueryClient } from "@tanstack/react-query";
import { createPost } from "../../Services/postservicees";
import toast from "react-hot-toast";
import { Spinner } from "@heroui/react";

import { useUserContext } from "../context/UserContex";

import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";

export default function CreatePost() {
  const { userDetails } = useUserContext();

  const queryClient = useQueryClient();

  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [privacy, setPrivacy] = useState<"public" | "only-me">("public");

  const [isloading, setIsloading] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Clean up image preview URLs
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    if (!showEmojiPicker) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Select image
  function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      e.currentTarget.value = "";
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  // Remove image
  function handleClosePreview() {
    setImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Create post
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isloading) return;

    if (!content.trim() && !image) {
      toast.error("Please write something or select an image");
      return;
    }

    setIsloading(true);

    try {
      const formData = new FormData();

      if (content.trim()) {
        formData.append("body", content.trim());
      }

      if (image) {
        formData.append("image", image);
      }

      formData.append("privacy", privacy);

      const response = await createPost(formData);
      const result = response.data;

      if (result?.success === false) {
        throw new Error(result.message || "Failed to create post");
      }

      toast.success(result?.message || "Post created successfully");

      setContent("");
      handleClosePreview();
      setPrivacy("public");
      setShowEmojiPicker(false);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["getFeed"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["myPosts"],
          
        }),
      ]);
    } catch (error) {
      console.error("Create post error:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to create post",
      );
    } finally {
      setIsloading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mb-4 w-full max-w-2xl rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5"
    >
      {/* User information */}
      <header className="mb-3 flex items-start gap-3">
        <img
          src={userDetails?.photo}
          alt={userDetails?.name || "User"}
          className="size-11 shrink-0 rounded-full object-cover"
        />

        <div className="min-w-0">
          <p className="text-sm font-bold capitalize text-gray-900">
            {userDetails?.name || "User"}
          </p>

          {/* Privacy */}
          <label className="relative mt-1 inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-2.5 pr-7 text-xs font-medium text-gray-600">
            {privacy === "public" ? (
              <Globe size={12} aria-hidden="true" />
            ) : (
              <Lock size={12} aria-hidden="true" />
            )}

            <span className="sr-only">Post privacy</span>

            <select
              value={privacy}
              onChange={(e) =>
                setPrivacy(e.target.value as "public" | "only-me")
              }
              disabled={isloading}
              className="cursor-pointer appearance-none bg-transparent outline-none"
            >
              <option value="public">Public</option>
              <option value="only-me">Only me</option>
            </select>

            <ChevronDown
              size={12}
              aria-hidden="true"
              className="pointer-events-none absolute right-2"
            />
          </label>
        </div>
      </header>

      {/* Post content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`What's on your mind, ${
          userDetails?.name?.split(" ")[0] || "User"
        }?`}
        rows={4}
        disabled={isloading}
        className="w-full resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-200"
      />

      {/* Image preview */}
      {imagePreview && (
        <div className="relative mt-3 overflow-hidden rounded-xl">
          <button
            type="button"
            onClick={handleClosePreview}
            disabled={isloading}
            aria-label="Remove image"
            className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-white/90 text-gray-700"
          >
            <X size={16} />
          </button>

          <img
            src={imagePreview}
            alt="Selected post image"
            className="max-h-64 w-full object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-3">
        <div className="flex flex-wrap items-center gap-4">
          {/* Upload image */}
          <label className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900">
            <ImageIcon
              size={18}
              className="pointer-events-none text-emerald-500"
            />
            Photo/video
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={isloading}
              className="sr-only"
              onChange={handleImage}
            />
          </label>

          {/* Feeling/activity */}
          <div ref={emojiPickerRef} className="relative">
            <button
              type="button"
              disabled={isloading}
              aria-expanded={showEmojiPicker}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="cursor-pointer flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900"
            >
              <Smile size={18} className="  text-amber-500" />
              Feeling/activity
            </button>

            {showEmojiPicker && (
              <div
                className="
      absolute left-0 top-full z-100 mt-2
      w-99 max-w-[calc(100vw-32px)]
      
[&_.epr-skin-tone-host]:!relative
[&_.epr-skin-tone-host]:!shrink-0

[&_.epr-skin-tone-host_button]:!size-5
[&_.epr-skin-tone-host_button]:!rounded-full
[&_.epr-skin-tone-host_button]:!cursor-pointer

[&_.epr-skin-tone-host_[role=menu]]:!rounded-xl
[&_.epr-skin-tone-host_[role=menu]]:!border
[&_.epr-skin-tone-host_[role=menu]]:!border-slate-200
[&_.epr-skin-tone-host_[role=menu]]:!bg-white
[&_.epr-skin-tone-host_[role=menu]]:!shadow-lg

      [&_.EmojiPickerReact]:!w-full
      [&_.EmojiPickerReact]:!overflow-hidden
      [&_.EmojiPickerReact]:!rounded-[20px]
      [&_.EmojiPickerReact]:!border-slate-200
      [&_.EmojiPickerReact]:!shadow-xl

      [&_[data-epr-part=search]]:!flex
      [&_[data-epr-part=search]]:!items-center
      [&_[data-epr-part=search]]:!gap-3

      [&_.epr-search-container]:!relative
      [&_.epr-search-container]:!min-w-0
      [&_.epr-search-container]:!flex-1

      [&_[data-epr-part=search-input]]:!h-[46px]
      [&_[data-epr-part=search-input]]:!w-full
      [&_[data-epr-part=search-input]]:!rounded-[13px]
      [&_[data-epr-part=search-input]]:!border-0
      [&_[data-epr-part=search-input]]:!bg-[#f1f1f1]
      [&_[data-epr-part=search-input]]:!pl-10
      [&_[data-epr-part=search-input]]:!outline-none
      [&_[data-epr-part=search-input]]:!shadow-none

      [&_.epr-icn-search]:!absolute
      [&_.epr-icn-search]:!left-3
      [&_.epr-icn-search]:!top-[65%]
      [&_.epr-icn-search]:!-translate-y-1/2
      [&_.epr-icn-search]:!pointer-events-none

      [&_.epr-skin-tone-host]:!shrink-0
      [&_.epr-skin-tone-host]:!flex
      [&_.epr-skin-tone-host]:!items-center
      [&_.epr-skin-tone-host]:!justify-center

      
[&_.epr-skin-tone-host]:!shrink-0
[&_.epr-skin-tone-host_button]:!size-[20px]
[&_.epr-skin-tone-host_button]:!rounded-full
[&_.epr-skin-tone-host_button]:!border
[&_.epr-skin-tone-host_button]:!border-amber-500
[&_.epr-skin-tone-host_button]:!bg-yellow-400
[&_.epr-skin-tone-host_button]:!shadow-none


      [&_.epr-emoji-category-label]:!bg-white
      [&_.epr-emoji-category-label]:!text-[17px]
      [&_.epr-emoji-category-label]:!font-normal

      [&_.epr-emoji-category-content]:!grid-cols-8
    "
              >
                <EmojiPicker
  theme={Theme.LIGHT}
  emojiStyle={EmojiStyle.NATIVE}
  width="100%"
  height={545}
  searchPlaceHolder="Search"
  skinTonesDisabled={false}
  previewConfig={{ showPreview: false }}
  onEmojiClick={(emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }}
/>
                
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isloading || (!content.trim() && !image)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isloading ? (
            <>
              <Spinner size="sm" />
              Posting...
            </>
          ) : (
            <>
              Create Post
              <Send size={14} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
