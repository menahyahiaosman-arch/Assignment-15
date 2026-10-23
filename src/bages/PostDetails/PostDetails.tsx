import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Globe2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { getsinglepost } from "../../Services/postservicees";
import type { PostCardI, TopComment } from "../../Types/postCard.types";
import { getPostComments } from "../../Services/comments.serveces";
import PostComment from "../../commponents/Post/PostComment";

function PostDetails() {
  const [details, setdetails] = useState<PostCardI | null>(null);
  const [allcomments, setAllcomments] = useState<TopComment[] | []>([]);
  const [visiblecomments, setVisiblecomments] = useState(2);
  const { id } = useParams();
  // console.log(id);
  async function getpostDetails(postId: string) {
    try {
      const { data } = await getsinglepost(postId);
      // console.log(data.data.post);
      setdetails(data.data.post);
    } catch (error) {
      console.log(error);
    }
  }
  async function getComments(postId: string) {
    try {
      const { data } = await getPostComments(postId);
      console.log(data.data.comments);
      setAllcomments(data.data.comments);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getpostDetails(id!);
    getComments(id!);
  }, [id]);

  function handleMoreComments (){
    setVisiblecomments(visiblecomments + 2)
  }

  return (
    <>
      {details && (
        <>
          <div className="mx-auto mt-6 w-full  px-4 sm:px-5">
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
              to="/feed"
            >
              <ArrowLeft aria-hidden="true" size={17} />
              Back to feed
            </Link>
          </div>
          <article className="mx-auto mb-6 mt-2 w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <header className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  className="size-11 shrink-0 rounded-full object-cover ring-2 ring-white"
                  src={details?.user.photo}
                  alt={details.user.name}
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-1.5">
                    <span className="truncate text-sm font-semibold text-gray-900">
                      {details.user.name}
                    </span>
                    <span className="truncate text-xs text-gray-500">
                      {details.user.username}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                    <span>
                      {new Date(details.createdAt).toLocaleString("en-us", {
                        timeStyle: "short",
                        dateStyle: "full",
                      })}
                    </span>
                    <span aria-hidden="true">·</span>
                    <Globe2 aria-label="Public" size={13} />
                    <span>{details.privacy}</span>
                  </div>
                </div>
              </div>
              <button
                aria-label="More post options"
                className="-mr-2 flex size-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                type="button"
              >
                <MoreHorizontal size={21} />
              </button>
            </header>

            <div className="px-4 pb-3 pt-3 text-sm leading-6 text-gray-800 sm:px-5">
              <p>{details.body}</p>
            </div>

            {details.image && (
              <img
                className="block max-h-[520px] w-full bg-gray-100 object-cover"
                src={details.image}
                alt={details.body}
              />
            )}

            <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-gray-500 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="flex size-[18px] items-center justify-center rounded-full bg-rose-500 text-white">
                  <Heart aria-hidden="true" fill="currentColor" size={11} />
                </span>
                <span>{details.likesCount} likes</span>
              </div>
              <div className="flex gap-3">
                <span>{details.commentsCount} comments</span>
                <span>{details.sharesCount} shares</span>
              </div>
            </div>

            <div className="mx-4 flex border-y border-gray-200 sm:mx-5">
              <button
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-medium transition hover:bg-gray-50 ${"text-gray-600"}`}
                type="button"
              >
                <Heart fill={"none"} size={18} />
                Like
              </button>
              <button
                className="flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                onClick={() =>
                  document.getElementById("post-details-comment")?.focus()
                }
                type="button"
              >
                <MessageCircle size={18} />
                Comment
              </button>
              <button
                className="flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                type="button"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>

            <section aria-label="Comments" className="px-4 pb-4 pt-3 sm:px-5">
              <button
                className="mb-3 flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
                type="button"
                onClick={handleMoreComments}
              >
                Show more comments
                <ChevronDown size={16} />
              </button>
              {allcomments.length > 0 ? (
                allcomments.slice(0, visiblecomments).map((Comment) => {
                  return (
                    <React.Fragment key={Comment._id}>
                      <div className="space-y-3 my-3">
                        <div className="flex items-start gap-2.5">
                          <img
                            alt={Comment.commentCreator.name}
                            className="mt-0.5 size-8 shrink-0 rounded-full object-cover"
                            src={Comment.commentCreator.photo}
                          />
                          <div className="min-w-0 rounded-2xl bg-gray-100 px-3 py-2">
                            <div className="flex flex-wrap items-baseline gap-x-1.5">
                              <span className="text-xs font-semibold text-gray-900">
                                {Comment.commentCreator.name}
                              </span>
                              <span className="text-[11px] text-gray-500">
                                {Comment.commentCreator.username}
                              </span>
                            </div>
                            <p className="mt-0.5 break-words text-sm leading-5 text-gray-800">
                              {Comment.content}
                            </p>
                            {Comment.image && <>
                            <img src={Comment.image} className="w-20 h-20" alt="" />
                            </>}
                            <span className="mt-1 block text-[11px] text-gray-500">
                              {new Date(Comment.createdAt).toLocaleString(
                                "en-us",
                                {
                                  timeStyle: "short",
                                  dateStyle: "full",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              ) : (
                <>
                  {details.topComment && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <img
                            alt={details.topComment.commentCreator.name}
                            className="mt-0.5 size-8 shrink-0 rounded-full object-cover"
                            src={details.topComment.commentCreator.photo}
                          />
                          <div className="min-w-0 rounded-2xl bg-gray-100 px-3 py-2">
                            <div className="flex flex-wrap items-baseline gap-x-1.5">
                              <span className="text-xs font-semibold text-gray-900">
                                {details.topComment.commentCreator.name}
                              </span>
                              <span className="text-[11px] text-gray-500">
                                {details.topComment.commentCreator.username}
                              </span>
                            </div>
                            <p className="mt-0.5 break-words text-sm leading-5 text-gray-800">
                              {details.topComment.content}
                            </p>
                            
                             {details.topComment.image && <>
                            <img src={details.topComment.image} className="w-20 h-20" alt="" />
                            </>}
                            <span className="mt-1 block text-[11px] text-gray-500">
                              {new Date(
                                details.topComment.createdAt,
                              ).toLocaleString("en-us", {
                                timeStyle: "short",
                                dateStyle: "full",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
              {/* form */}
              <PostComment postId={details._id} getComments={getComments}/>
            </section>
          </article>
        </>
      )}
    </>
  );
}

export default PostDetails;
