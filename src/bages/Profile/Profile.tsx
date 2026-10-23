import {  useState } from "react";
import { Bookmark, ImageIcon, Mail, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useUserContext } from "../../commponents/context/UserContex";

import PostCard from "../../commponents/Post/PostCard";

import {
  getMyPosts,
  getSavedPosts,
} from "../../Services/profilePosts.services";
import ProfilePhoto from "../../commponents/ProfilePhoto/ProfilePhoto";
function Profile() {
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  const { userDetails } = useUserContext();

  const userId = userDetails?._id ?? "";

  const bookmarkIds = (userDetails?.bookmarks ?? []) as string[];

  const {
    data: myPosts = [],
    isPending: myPostsLoading,
    isError: myPostsError,
  } = useQuery({
    queryKey: ["myPosts", userId],
    queryFn: () => getMyPosts(userId),
    enabled: Boolean(userId),
  });

  const {
    data: savedPosts = [],
    isPending: savedPostsLoading,
    isError: savedPostsError,
  } = useQuery({
    queryKey: ["savedPosts", userId, bookmarkIds],
    queryFn: () => getSavedPosts(bookmarkIds),
    enabled: Boolean(userId) && activeTab === "saved",
  });

  if (!userDetails) {
    return null;
  }

  const displayedPosts = activeTab === "posts" ? myPosts : savedPosts;

  const isLoading = activeTab === "posts" ? myPostsLoading : savedPostsLoading;

  const isError = activeTab === "posts" ? myPostsError : savedPostsError;

  const followersCount =
    userDetails.followersCount ?? userDetails.followers?.length ?? 0;

  const followingCount =
    userDetails.followingCount ?? userDetails.following?.length ?? 0;

  const bookmarksCount = userDetails.bookmarksCount ?? bookmarkIds.length;

  return (
    <main className="min-h-screen bg-[#f2f5f9] pb-12 pt-1">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        {/* PROFILE COVER AND CARD */}
        <section className="relative">
          {/* Blue gradient cover */}
          <div
            className="
              h-[230px]
              w-full
              rounded-t-[34px]
              bg-gradient-to-r
              from-[#1b2438]
              via-[#234a75]
              to-[#6b9fc7]
              sm:h-[280px]
              lg:h-[300px]
            "
          />

          {/* White background behind card */}
          <div className="h-[390px] rounded-b-[34px] bg-white shadow-[0_12px_30px_rgba(20,35,60,0.07)] sm:h-[355px] lg:h-[400px]" />

          {/* Floating profile card */}
          <div
            className="
              absolute
              inset-x-5
              top-[165px]
              rounded-[30px]
              bg-gradient-to-b
              from-[#f8fafc]
              to-white
              px-5
              pb-10
              pt-8
              shadow-[0_10px_30px_rgba(20,35,60,0.04)]
              sm:inset-x-9
              sm:top-[210px]
              sm:px-8
              lg:inset-x-10
              lg:top-[220px]
              lg:px-9
            "
          >
            {/* User information and statistics */}
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              {/* User identity */}
              <div className="flex min-w-0 items-center gap-5">
                <ProfilePhoto
                  photo={userDetails?.photo}
                  name={userDetails?.name}
                  // className="
                  //   h-[100px]
                  //   w-[100px]
                  //   shrink-0
                  //   rounded-full
                  //   border-[4px]
                  //   border-white
                  //   object-cover
                  //   shadow-[0_2px_10px_rgba(40,100,180,0.2)]
                  //   ring-2
                  //   ring-blue-100
                  //   sm:h-[115px]
                  //   sm:w-[115px]
                  // "
                />

                <div className="min-w-0">
                  <h1 className="truncate text-[28px] font-extrabold tracking-tight text-[#101a30] sm:text-[36px]">
                    {userDetails.name}
                  </h1>

                  <p className="mt-1 text-base font-medium text-[#647895] sm:text-[20px]">
                    {userDetails.username}
                  </p>

                  <span
                    className="
                      mt-3
                      inline-flex
                      max-w-full
                      items-center
                      gap-2
                      whitespace-nowrap
                      rounded-full
                      border
                      border-blue-100
                      bg-[#eaf3ff]
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      text-[#0755c8]
                    "
                  >
                    <Users size={15} className="shrink-0" />
                    Route Posts member
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid w-full grid-cols-3 gap-2 sm:gap-3 lg:w-[400px] lg:shrink-0">
                {/* Followers */}
                <div className="flex  flex-col items-center justify-center rounded-[22px] border border-[#dce5f0] bg-white px-2 py-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#647895] sm:text-xs">
                    Followers
                  </p>

                  <p className="mt-3 text-[30px] font-extrabold text-[#111b30] sm:text-[36px]">
                    {followersCount}
                  </p>
                </div>

                {/* Following */}
                <div className="flex min-h-[115px] flex-col items-center justify-center rounded-[22px] border border-[#dce5f0] bg-white px-2 py-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#647895] sm:text-xs">
                    Following
                  </p>

                  <p className="mt-3 text-[30px] font-extrabold text-[#111b30] sm:text-[36px]">
                    {followingCount}
                  </p>
                </div>

                {/* Bookmarks */}
                <div className="flex min-h-[115px] flex-col items-center justify-center rounded-[22px] border border-[#dce5f0] bg-white px-2 py-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#647895] sm:text-xs">
                    Bookmarks
                  </p>

                  <p className="mt-3 text-[30px] font-extrabold text-[#111b30] sm:text-[36px]">
                    {bookmarksCount}
                  </p>
                </div>
              </div>
            </div>

            {/* About and post counts */}
            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.85fr_1fr]">
              {/* About */}
              <div
                className="
                  min-h-[205px]
                  rounded-[22px]
                  border
                  border-[#dce5f0]
                  bg-[#f8fafc]
                  p-5
                "
              >
                <h2 className="text-base font-extrabold text-[#1d293e]">
                  About
                </h2>

                <p className="mt-5 flex items-center gap-3 break-all text-sm text-[#536782] sm:text-base">
                  <Mail size={19} className="shrink-0 text-[#647b9c]" />

                  {userDetails.email}
                </p>

                <p className="mt-4 flex items-center gap-3 text-sm text-[#536782] sm:text-base">
                  <Users size={19} className="shrink-0 text-[#647b9c]" />
                  Active on Route Posts
                </p>
              </div>

              {/* Post counters */}
              <div className="grid grid-rows-2 gap-4">
                {/* My Posts */}
                <div className="flex flex-col justify-center rounded-[22px] border border-[#d6e7ff] bg-[#f5f9ff] px-5 py-4">
                  <p className="text-xs font-extrabold uppercase text-[#2155a0] sm:text-sm">
                    My Posts
                  </p>

                  <p className="mt-2 text-[28px] font-extrabold leading-none text-[#101a30]">
                    {myPosts.length}
                  </p>
                </div>

                {/* Saved Posts */}
                <div className="flex flex-col justify-center rounded-[22px] border border-[#d6e7ff] bg-[#f5f9ff] px-5 py-4">
                  <p className="text-xs font-extrabold uppercase text-[#2155a0] sm:text-sm">
                    Saved Posts
                  </p>

                  <p className="mt-2 text-[28px] font-extrabold leading-none text-[#101a30]">
                    {bookmarksCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="mt-5 flex min-h-[65px] items-center justify-between rounded-[20px] border border-[#e6edf5] bg-white px-4 py-3 shadow-[0_4px_15px_rgba(20,35,60,0.04)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                activeTab === "posts"
                  ? "bg-[#eaf3ff] text-[#0756d3]"
                  : "text-[#687c97] hover:bg-slate-50"
              }`}
            >
              <ImageIcon size={18} />
              My Posts
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                activeTab === "saved"
                  ? "bg-[#eaf3ff] text-[#0756d3]"
                  : "text-[#687c97] hover:bg-slate-50"
              }`}
            >
              <Bookmark size={18} />
              Saved
            </button>
          </div>

          <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#eaf3ff] px-3 text-sm font-bold text-[#0756d3]">
            {activeTab === "posts" ? myPosts.length : savedPosts.length}
          </span>
        </section>

        {/* Posts */}
        <section className="mt-5 w-full">
          {isLoading ? (
            <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500">
              Loading posts...
            </div>
          ) : isError ? (
            <div className="rounded-2xl bg-white p-6 text-center text-sm text-red-500">
              Failed to load posts.
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500">
              {activeTab === "posts"
                ? "You have not posted yet."
                : "You have no saved posts."}
            </div>
          ) : (
            <div className="flex w-full flex-col gap-4">
              {displayedPosts.map((post) => (
                <div key={post._id} className="w-full min-w-0">
                  <PostCard post={post} fullWidth />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Profile;
