
import { useQuery } from "@tanstack/react-query";

import PostCard from "../../commponents/Post/PostCard";
import Sidebar from "../../commponents/Sidebar/Sidebar";
import SuggestedFriends from "../../commponents/SuggestedFriend/SuggestedFriends";
import CreatePost from "../../commponents/Post/CreatePost";
import PostSkeleton from "../../commponents/Post/PostSkeleton";

import { getUserFeed } from "../../Services/feedservices";
import type { PostCardI } from "../../Types/postCard.types";

type FeedResponse = {
  success: boolean;
  data: {
    posts: PostCardI[];
  };
  meta?: {
    pagination?: {
      currentPage: number;
      numberOfPages: number;
      nextPage?: number | null;
    };
  };
};

export default function Newsfeed() {
  const {
    data,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["getFeed"],

    queryFn: async (): Promise<FeedResponse> => {
      const response = await getUserFeed(1);

      // دعم استجابة Axios الكاملة
      const result: FeedResponse =
        response?.data?.data?.posts
          ? response.data
          : response;

      return result;
    },
  });

  // عرض أول 20 بوست فقط
  const posts: PostCardI[] = (
    data?.data?.posts ?? []
  ).slice(0, 30);

  return (
    <div className="mx-auto max-w-7xl px-3">
      <div className="grid grid-cols-12 gap-4">

        {/* LEFT SIDEBAR */}
        <div className="col-span-2">
          <Sidebar />
        </div>

        {/* POSTS */}
        <main className="col-span-7 min-w-0">
          <CreatePost />

          {isPending ? (
            <PostSkeleton />
          ) : isError ? (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-600">
              Failed to load posts: {error.message}
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                />
              ))}

              {posts.length === 0 && (
                <p className="mt-6 text-center text-gray-500">
                  No posts found.
                </p>
              )}

              {posts.length > 0 && (
                <p className="my-6 text-center text-sm text-gray-400">
                  You've reached the end.
                </p>
              )}
            </>
          )}
        </main>

        {/* SUGGESTED FRIENDS */}
        <div className="col-span-3">
          <div className="sticky top-24">
            <SuggestedFriends />
          </div>
        </div>

      </div>
    </div>
  );
}




