
import { useState } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import {
  getSuggestedFriends,
  followUser,
} from "../../Services/suggestedFriends.services";

export default function SuggestedFriends() {
  const [search, setSearch] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: friends = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["suggestedFriends", 1, 20],
    queryFn: () => getSuggestedFriends(1, 20),
  });

  const followMutation = useMutation({
    mutationFn: followUser,

    onSuccess: async () => {
      toast.success("Followed successfully");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["suggestedFriends"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["userDetails"],
        }),
      ]);
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Couldn't follow this user"
      );
    },

    onSettled: () => {
      setPendingUserId(null);
    },
  });

  const filteredFriends = friends.filter((friend) => {
    const searchValue = search.toLowerCase().trim();

    return (
      (friend.name ?? "").toLowerCase().includes(searchValue) ||
      (friend.username ?? "").toLowerCase().includes(searchValue)
    );
  });

  function handleFollow(userId: string) {
    if (pendingUserId) return;

    setPendingUserId(userId);
    followMutation.mutate(userId);
  }

  return (
    <aside className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-main">
          <Users size={18} />
          Suggested Friends
        </h2>

        <span className="text-sm font-semibold text-gray-400">
          {friends.length}
        </span>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search friends"
          placeholder="Search friends..."
          className="w-full rounded-xl bg-gray-100 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-main/30"
        />
      </div>

      {isPending ? (
        <p className="py-6 text-center text-sm text-gray-500">
          Loading friends...
        </p>
      ) : isError ? (
        <p className="py-6 text-center text-sm text-red-500">
          Failed to load friends.
        </p>
      ) : filteredFriends.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">
          No friends found.
        </p>
      ) : (
        <ul className="space-y-3">
          {filteredFriends.slice(0, 5).map((friend) => (
            <li
              key={friend._id}
              className="space-y-3 rounded-2xl border border-gray-200 p-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={friend.photo}
                  alt={friend.name}
                  className="size-9 shrink-0 rounded-full object-cover"
                />

                <div className="min-w-0 grow">
                  <p className="truncate text-sm font-bold text-main">
                    {friend.name}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    @{friend.username}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleFollow(friend._id)}
                  disabled={pendingUserId !== null}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-main/10 px-2.5 py-1.5 text-xs font-semibold text-main transition hover:bg-main/20 disabled:opacity-50"
                >
                  <UserPlus size={14} />

                  {pendingUserId === friend._id
                    ? "Following..."
                    : "Follow"}
                </button>
              </div>

              <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {friend.followersCount ?? 0} followers
              </span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => navigate("/suggestions")}
        className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-main transition hover:bg-gray-200"
      >
        View more
      </button>
    </aside>
  );
}



