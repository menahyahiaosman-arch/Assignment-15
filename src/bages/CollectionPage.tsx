
import { useContext, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import { UserContext } from "../commponents/context/UserContex";

import {
  getCollectionPosts,
  type CollectionMode,
} from "../Services/feedservices";

import Sidebar from "../commponents/Sidebar/Sidebar";
import SuggestedFriends from "../commponents/SuggestedFriend/SuggestedFriends";
import CreatePost from "../commponents/Post/CreatePost";
import PostCard from "../commponents/Post/PostCard";
import PostSkeleton from "../commponents/Post/PostSkeleton";

import type { PostCardI } from "../Types/postCard.types";

type CollectionResponse = {
  success?: boolean;
  data?: {
    posts?: PostCardI[];
    bookmarks?: PostCardI[];
  };
  meta?: {
    pagination?: {
      currentPage: number;
      numberOfPages: number;
      nextPage?: number | null;
    };
  };
};

type Props = {
  mode: CollectionMode;
};

export default function CollectionPage({ mode }: Props) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { userDetails } = useContext(UserContext);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<
    CollectionResponse,
    Error,
    {
      pages: CollectionResponse[];
      pageParams: unknown[];
    },
    [string, CollectionMode],
    number
  >({
    queryKey: ["collectionPosts", mode],

    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      getCollectionPosts(mode, pageParam),

    getNextPageParam: (lastPage) => {
      const pagination = lastPage.meta?.pagination;

      if (!pagination) {
        return undefined;
      }

      if (
        pagination.currentPage >=
        pagination.numberOfPages
      ) {
        return undefined;
      }

      return (
        pagination.nextPage ??
        pagination.currentPage + 1
      );
    },
  });

  // تجميع البوستات من الصفحات المحملة
  const allPosts: PostCardI[] =
    data?.pages.flatMap((page) => {
      const payload = page.data;

      return payload?.posts ?? payload?.bookmarks ?? [];
    }) ?? [];

  // إخفاء بوستات المستخدم الحالي من Community
  const posts: PostCardI[] =
    mode === "community"
      ? userDetails?._id
        ? allPosts.filter(
            (post) => post.user?._id !== userDetails._id
          )
        : []
      : allPosts;

  // تحميل المزيد من البوستات عند النزول
  useEffect(() => {
    const element = loadMoreRef.current;

    if (
      !element ||
      !hasNextPage ||
      isFetchingNextPage
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "300px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-3 lg:grid-cols-12">

      {/* Sidebar */}
      <div className="lg:col-span-2">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="min-w-0 space-y-4 lg:col-span-7">

        {/* Create Post - موجود فوق في كل الصفحات */}
        <CreatePost />

        {/* Posts */}
        {isPending ? (
          <PostSkeleton />
        ) : isError ? (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-red-600">
              Failed to load posts: {error.message}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 text-sm font-semibold text-blue-600"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                />
              ))
            ) : (
              <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
                <p>
                  {mode === "community"
                    ? "No posts from other people yet."
                    : "No posts yet. Be the first one to publish."}
                </p>

                {mode !== "saved" && (
                  <Link
                    to="/feed"
                    className="mt-3 inline-block text-sm font-semibold text-blue-600"
                  >
                    Go to Feed
                  </Link>
                )}
              </div>
            )}

            <div
              ref={loadMoreRef}
              className="h-4"
            />

            {isFetchingNextPage && (
              <PostSkeleton />
            )}

            {!hasNextPage && posts.length > 0 && (
              <p className="py-4 text-center text-sm text-gray-400">
                You've reached the end.
              </p>
            )}
          </>
        )}
      </main>

      {/* Suggested Friends - موجودة في كل الصفحات */}
      <div className="lg:col-span-3">
        <SuggestedFriends />
      </div>

    </div>
  );
}



