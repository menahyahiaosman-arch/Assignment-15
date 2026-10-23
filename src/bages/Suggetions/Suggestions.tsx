
import { useMemo, useState } from "react";
import { ArrowLeft, Search, UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  getSuggestedFriends,
  followUser,
  type SuggestedFriend,
} from "../../Services/suggestedFriends.services";

export default function Suggestions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const LIMIT = 20;

  const {
    data: friends = [],
    isPending,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["suggestedFriends", page, LIMIT],
    queryFn: () => getSuggestedFriends(page, LIMIT),
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

  const filteredFriends = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return friends.filter((friend: SuggestedFriend) => {
      return (
        (friend.name ?? "")
          .toLowerCase()
          .includes(searchValue) ||
        (friend.username ?? "")
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }, [friends, search]);

  function handleFollow(userId: string) {
    if (pendingUserId !== null) return;

    setPendingUserId(userId);
    followMutation.mutate(userId);
  }

  return (
    <main className="min-h-screen bg-[#f0f3f8] px-4 py-5 sm:px-6">
      <div className="mx-auto w-full max-w-[990px]">
        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => navigate("/feed")}
          className="mb-5 flex items-center gap-2 rounded-xl border border-[#dbe5f2] bg-white px-4 py-3 text-sm font-bold text-[#18345e] shadow-sm transition hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
          Back to feed
        </button>

        {/* MAIN CARD */}
        <section className="rounded-[20px] border border-[#dbe5f2] bg-white p-4 shadow-sm sm:p-[18px]">
          {/* HEADER */}
          <div className="mb-4 flex items-center justify-between">
            <h1 className="flex items-center gap-2 text-[20px] font-bold text-[#102b55]">
              <Users size={21} className="text-[#0067ff]" />
              All Suggested Friends
            </h1>

            <span className="rounded-full bg-[#f1f4f8] px-3 py-1 text-xs font-bold text-[#506583]">
              {friends.length}
            </span>
          </div>

          {/* SEARCH */}
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#92a4bc]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or username..."
              aria-label="Search suggested friends"
              className="h-[47px] w-full rounded-[14px] border border-[#dce5f1] bg-[#f8fafc] pl-11 pr-4 text-sm text-[#1c3558] outline-none placeholder:text-[#9aabc1] focus:border-blue-400"
            />
          </div>

          {/* FRIENDS */}
          {isPending ? (
            <div className="py-16 text-center text-sm text-gray-500">
              Loading suggested friends...
            </div>
          ) : isError ? (
            <div className="py-16 text-center text-sm text-red-500">
              Failed to load suggested friends.
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-500">
              No friends found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredFriends.map((friend: SuggestedFriend) => (
                <div
                  key={friend._id}
                  className="flex min-h-[121px] flex-col justify-between rounded-[15px] border border-[#dce5f1] bg-white p-[14px] transition hover:border-blue-200 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.photo}
                      alt={friend.name}
                      className="size-[52px] shrink-0 rounded-full bg-gray-100 object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-bold text-[#10203c]">
                        {friend.name}
                      </h2>

                      <p className="mt-0.5 truncate text-xs text-[#6981a2]">
                        @{friend.username}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFollow(friend._id)}
                      disabled={pendingUserId !== null}
                      className="flex shrink-0 items-center gap-1 rounded-full bg-[#e9f3ff] px-3 py-2 text-xs font-bold text-[#0067ff] transition hover:bg-[#dbeaff] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <UserPlus size={14} />

                      {pendingUserId === friend._id
                        ? "Following..."
                        : "Follow"}
                    </button>
                  </div>

                  <div className="mt-3">
                    <span className="inline-block rounded-lg bg-[#f3f6fa] px-2 py-1 text-[11px] text-[#5d7597]">
                      {friend.followersCount ?? 0} followers
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {!isPending && !isError && (
            <div className="mt-6 flex items-center justify-center gap-3 border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={() => {
                  setPage((previous) => Math.max(1, previous - 1));
                  setSearch("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === 1 || isFetching}
                className="rounded-xl border border-[#dce5f1] bg-white px-4 py-2 text-sm font-semibold text-[#17365f] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm font-semibold text-[#506583]">
                Page {page}
              </span>

              <button
                type="button"
                onClick={() => {
                  setPage((previous) => previous + 1);
                  setSearch("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={friends.length < LIMIT || isFetching}
                className="rounded-xl bg-[#0b63e5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
