
import { useQuery } from "@tanstack/react-query";
import { Users, X } from "lucide-react";
import { useEffect } from "react";

import { getPostLikes } from "../../Services/postLikes.services";

type Props = {
  postId: string;
  onClose: () => void;
};

type LikeUser = {
  _id: string;
  name?: string;
  username?: string;
  photo?: string;
  user?: {
    _id?: string;
    name?: string;
    username?: string;
    photo?: string;
  };
};

export default function PostLikesModal({
  postId,
  onClose,
}: Props) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["postLikes", postId],
    queryFn: () => getPostLikes(postId),
  });

  const responseData = data?.data;

  const likes: LikeUser[] = Array.isArray(responseData)
    ? responseData
    : Array.isArray(responseData?.likes)
    ? responseData.likes
    : Array.isArray(responseData?.users)
    ? responseData.users
    : [];

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101c35]/65 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[650px] overflow-hidden rounded-[20px] bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#172033]">
            <Users size={21} className="text-[#006bff]" />
            People who reacted
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
          {isPending ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Loading reactions...
            </p>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-red-500">
              Failed to load reactions.
            </p>
          ) : likes.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No reactions yet.
            </p>
          ) : (
            <div className="space-y-4">
              {likes.map((like, index) => {
                const user = like.user ?? like;

                return (
                  <div
                    key={user._id ?? like._id ?? index}
                    className="flex items-center gap-4"
                  >
                    <img
                      src={
                        user.photo ||
                        "https://placehold.co/80x80?text=User"
                      }
                      alt={user.name ?? "User"}
                      className="size-11 shrink-0 rounded-full object-cover"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#172033]">
                        {user.name ?? "Unknown user"}
                      </p>

                      <p className="truncate text-sm text-[#71819a]">
                        @{user.username ?? ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
