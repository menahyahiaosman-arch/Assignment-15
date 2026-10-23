import {
  Bookmark,
  ChevronDown,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Repeat2,
  Share2,
  Trash2,
  X,
} from "lucide-react";

import { Link } from "react-router";
import {  useEffect, useRef, useState } from "react";
import type { PostCardI, TopComment } from "../../Types/postCard.types";

import {
  getPostComments,
  updatePostComment,
  deletePostComment,
} from "../../Services/comments.serveces";

import {
  deletePost,
  togglePostLike,
  togglePostBookmark,
  sharePost,
} from "../../Services/postservicees";

import PostComment from "./PostComment";
import EditPost from "./EditPost";
import { AlertDialog, Button, Dropdown, Label } from "@heroui/react";
import { useUserContext } from "../context/UserContex";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import PostLikesModal from "./PostLikesModal";

const COMMENTS_LIMIT = 5;

type SharedPostData = {
  _id?: string;
  id?: string;
  body?: string | null;
  image?: string | null;
  createdAt?: string;
  privacy?: string;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  user?: {
    _id?: string;
    name?: string;
    username?: string;
    photo?: string;
  };
};

type DisplayPost = PostCardI & {
  isShare?: boolean;
  sharedPost?: SharedPostData | null;
};

type PostCardProps = {
  post: DisplayPost;
  fullWidth?: boolean;
};

type CommentsResponse = {
  data?: {
    comments?: TopComment[];
  };
  meta?: {
    pagination?: {
      currentPage?: number;
      numberOfPages?: number;
      hasNextPage?: boolean;
      nextPage?: number | null;
    };
  };
};

export default function PostCard({ post, fullWidth = false }: PostCardProps) {
  const { userDetails } = useUserContext();
  const queryClient = useQueryClient();

  const commentInputId = `post-comment-${post._id}`;

  const [allComments, setAllComments] = useState<TopComment[]>([]);
  const [commentSort, setCommentSort] = useState<"relevant" | "newest">(
    "relevant",
  );
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [commentsError, setCommentsError] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? 0);

  const [showEditPost, setShowEditPost] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<TopComment | null>(
    null,
  );

  const [commentEditError, setCommentEditError] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [deletingComment, setDeletingComment] = useState(false);

  const [liked, setLiked] = useState(() =>
    Boolean(userDetails?._id && post.likes?.includes(userDetails._id)),
  );

  const [likesCount, setLikesCount] = useState(
    post.likesCount ?? post.likes?.length ?? 0,
  );

  const [bookmarked, setBookmarked] = useState(Boolean(post.bookmarked));

  const [busyAction, setBusyAction] = useState(false);
  const requestIdRef = useRef(0);

  const originalPost = post.isShare ? post.sharedPost : null;
  const originalPostId = originalPost?._id ?? originalPost?.id;
  const [showLikesModal, setShowLikesModal] = useState(false);
  const sortedComments = [...allComments].sort((a, b) => {
    if (commentSort === "newest") {
      return (
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
      );
    }
    return 0;
  });

  function formatDate(value?: string) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getUniqueComments(comments: TopComment[]) {
    return Array.from(
      new Map(comments.map((comment) => [comment._id, comment])).values(),
    );
  }

  function readPagination(
    response: CommentsResponse,
    page: number,
    received: number,
  ) {
    const pagination = response.meta?.pagination;

    if (typeof pagination?.numberOfPages === "number") {
      return page < pagination.numberOfPages;
    }

    if (typeof pagination?.hasNextPage === "boolean") {
      return pagination.hasNextPage;
    }

    if (pagination?.nextPage !== undefined) {
      return pagination.nextPage !== null;
    }

    return received === COMMENTS_LIMIT;
  }

  async function loadComments(page = 1, append = false) {
    const requestId = ++requestIdRef.current;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoadingComments(true);
      setCommentsError(false);
    }

    try {
      const response = await getPostComments(post._id, page, COMMENTS_LIMIT);

      const result = response.data as CommentsResponse;
      const newComments = result.data?.comments ?? [];

      if (requestId !== requestIdRef.current) return;

      setAllComments((previous) =>
        getUniqueComments(append ? [...previous, ...newComments] : newComments),
      );

      setCommentsPage(page);
      setHasMoreComments(readPagination(result, page, newComments.length));
    } catch {
      if (requestId === requestIdRef.current) {
        setCommentsError(true);
        toast.error("Couldn't load comments");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoadingComments(false);
        setLoadingMore(false);
      }
    }
  }

  async function invalidatePosts() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["getFeed"] }),
      queryClient.invalidateQueries({ queryKey: ["collectionPosts"] }),
      queryClient.invalidateQueries({ queryKey: ["myPosts"] }),
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] }),
    ]);
  }

  async function refreshComments() {
    await loadComments(1, false);
    await invalidatePosts();
  }

  useEffect(() => {
    setAllComments([]);
    setCommentsPage(1);
    setHasMoreComments(false);
    setCommentsCount(post.commentsCount ?? 0);

    void loadComments(1, false);

    return () => {
      requestIdRef.current += 1;
    };
  }, [post._id]);

  useEffect(() => {
    setLiked(
      Boolean(userDetails?._id && post.likes?.includes(userDetails._id)),
    );

    setLikesCount(post.likesCount ?? post.likes?.length ?? 0);

    setBookmarked(Boolean(post.bookmarked));
  }, [post.likes, post.likesCount, post.bookmarked, userDetails?._id]);

  useEffect(() => {
    setCommentsCount(post.commentsCount ?? 0);
  }, [post.commentsCount]);

  async function handleMoreComments() {
    if (loadingMore || !hasMoreComments) return;
    await loadComments(commentsPage + 1, true);
  }

  async function deleteMyPost() {
    try {
      const { data } = await deletePost(post._id);

      toast.success(data?.message || "Post deleted");
      setShowDeleteDialog(false);
      await invalidatePosts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not delete post");
    }
  }

  async function handleLike() {
    if (busyAction) return;

    const wasLiked = liked;

    setLiked(!wasLiked);
    setLikesCount((count) => Math.max(0, count + (wasLiked ? -1 : 1)));
    setBusyAction(true);

    try {
      await togglePostLike(post._id);
      await invalidatePosts();
    } catch (error: any) {
      setLiked(wasLiked);
      setLikesCount((count) => Math.max(0, count + (wasLiked ? 1 : -1)));

      toast.error(error?.response?.data?.message || "Couldn't update like");
    } finally {
      setBusyAction(false);
    }
  }

  async function handleBookmark() {
    try {
      const { data } = await togglePostBookmark(post._id);

      setBookmarked((value) => !value);

      toast.success(
        data?.message ||
          (bookmarked ? "Post removed from saved" : "Post saved"),
      );

      await invalidatePosts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Couldn't save post");
    }
  }

  async function handleShare() {
    if (busyAction) return;

    setBusyAction(true);

    try {
      const response = await sharePost(post._id);

      console.log("Shared post data:", response.data);

      toast.success(response.data?.message || "Post shared successfully");

      await invalidatePosts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Couldn't share post");
    } finally {
      setBusyAction(false);
    }
  }

  async function handleSaveComment(comment: TopComment) {
    try {
      await navigator.clipboard.writeText(comment.content ?? "");
      toast.success("Comment copied");
    } catch {
      toast.error("Couldn't copy comment");
    }
  }

  function startEditingComment(comment: TopComment) {
    setCommentEditError("");
    setEditingCommentId(comment._id);
    setEditContent(comment.content ?? "");
  }

  function cancelEditingComment() {
    setEditingCommentId(null);
    setEditContent("");
  }

  async function handleUpdateComment() {
    if (!editingCommentId || !editContent.trim() || savingComment) {
      return;
    }

    setSavingComment(true);
    setCommentEditError("");

    try {
      await updatePostComment(post._id, editingCommentId, editContent.trim());

      toast.success("Comment updated");
      cancelEditingComment();
      await refreshComments();
    } catch (error: any) {
      setCommentEditError(
        error?.response?.data?.message ||
          "Comment Not Found or you are not allowed to perform this action",
      );
    } finally {
      setSavingComment(false);
    }
  }

  async function handleDeleteComment() {
    if (!commentToDelete || deletingComment) return;

    setDeletingComment(true);

    try {
      await deletePostComment(post._id, commentToDelete._id);

      toast.success("Comment deleted");

      setCommentsCount((count) => Math.max(0, count - 1));
      setCommentToDelete(null);
      await refreshComments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Couldn't delete comment");
    } finally {
      setDeletingComment(false);
    }
  }

  function focusCommentInput() {
    document.getElementById(commentInputId)?.focus();
  }

  function renderComment(comment: TopComment, isTopComment = false) {
    const isOwner =
      Boolean(userDetails?._id) &&
      comment.commentCreator?._id === userDetails?._id;

    const isEditing = editingCommentId === comment._id;

    return (
      <div key={comment._id} className="flex items-start gap-2.5 py-2">
        <img
          src={comment.commentCreator?.photo}
          alt={comment.commentCreator?.name}
          className="mt-1 size-9 shrink-0 rounded-full bg-gray-100 object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 rounded-2xl bg-gray-100 px-3 py-2">
              {isTopComment && (
                <p className="mb-1 text-sm font-extrabold uppercase text-green-500">
                  TOP COMMENT
                </p>
              )}

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-900">
                  {comment.commentCreator?.name}
                </span>

                <span className="text-xs text-gray-500">
                  {comment.commentCreator?.username}
                </span>
              </div>

              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-blue-500"
                  />

                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEditingComment}
                      disabled={savingComment}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleUpdateComment}
                      disabled={savingComment || !editContent.trim()}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {savingComment ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-1 break-words text-sm leading-5 text-gray-800">
                    {comment.content}
                  </p>

                  {comment.image && (
                    <img
                      src={comment.image}
                      alt="Comment attachment"
                      className="mt-2 max-h-64 max-w-full rounded-xl object-cover"
                    />
                  )}
                </>
              )}
            </div>

            <Dropdown>
              <Button
                aria-label="Comment options"
                variant="ghost"
                className="shrink-0 rounded-full"
              >
                <MoreHorizontal size={18} />
              </Button>

              <Dropdown.Popover>
                <Dropdown.Menu className="min-w-[175px] rounded-xl bg-white p-1 shadow-lg">
                  <Dropdown.Item
                    id="copy-comment"
                    textValue="Copy comment"
                    onClick={() => handleSaveComment(comment)}
                  >
                    <Bookmark size={16} />
                    <Label>Copy comment</Label>
                  </Dropdown.Item>

                  {isOwner && (
                    <>
                      <Dropdown.Item
                        id="edit-comment"
                        textValue="Edit comment"
                        onClick={() => startEditingComment(comment)}
                      >
                        <Pencil size={16} />
                        <Label>Edit comment</Label>
                      </Dropdown.Item>

                      <Dropdown.Item
                        id="delete-comment"
                        textValue="Delete comment"
                        variant="danger"
                        onClick={() => setCommentToDelete(comment)}
                      >
                        <Trash2 size={16} />
                        <Label>Delete comment</Label>
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>

          <div className="mt-1 px-3 text-xs text-gray-500">
            {formatDate(comment.createdAt)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <article
        className={`mx-auto my-3 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${
          fullWidth ? "max-w-none" : "max-w-2xl"
        }`}
      >
        {/* POST HEADER */}
        <header className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={post.user.photo}
              alt={post.user.name}
              className="size-11 shrink-0 rounded-full object-cover"
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-900">
                  {post.user.name}
                </span>

                <span className="text-xs text-gray-500">
                  {post.user.username}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                <span>{formatDate(post.createdAt)}</span>
                <span>·</span>
                <span>{post.privacy}</span>
              </div>
            </div>
          </div>

          {userDetails?._id && (
            <Dropdown>
              <Button
                aria-label="More post options"
                variant="ghost"
                className="rounded-full bg-slate-100 text-slate-700"
              >
                <MoreHorizontal size={20} />
              </Button>

              <Dropdown.Popover>
                <Dropdown.Menu className="min-w-[210px] rounded-2xl bg-white p-2 shadow-lg">
                  <Dropdown.Item
                    id="save-post"
                    textValue={bookmarked ? "Remove from saved" : "Save post"}
                    onClick={handleBookmark}
                  >
                    <Bookmark
                      size={18}
                      fill={bookmarked ? "currentColor" : "none"}
                    />
                    <Label>
                      {bookmarked ? "Remove from saved" : "Save post"}
                    </Label>
                  </Dropdown.Item>

                  {post.user._id === userDetails._id && (
                    <>
                      <Dropdown.Item
                        id="edit-post"
                        textValue="Edit post"
                        onClick={() => setShowEditPost(true)}
                      >
                        <Pencil size={18} />
                        <Label>Edit post</Label>
                      </Dropdown.Item>

                      <Dropdown.Item
                        id="delete-post"
                        textValue="Delete post"
                        variant="danger"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 size={18} />
                        <Label>Delete post</Label>
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          )}
        </header>

        {/* POST CONTENT */}
        {showEditPost ? (
          <EditPost
            postId={post._id}
            setshowEditPost={setShowEditPost}
            getAllPost={invalidatePosts}
          />
        ) : (
          <>
            {/* SHARE INFORMATION */}
            {post.isShare && (
              <div className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 sm:mx-5">
                <Repeat2 size={18} className="shrink-0" />
                <span>{post.user.name} shared a post</span>
              </div>
            )}

            {/* TEXT WRITTEN ON SHARED OR NORMAL POST */}
            {post.body && (
              <div className="px-4 pb-3 pt-3 text-sm leading-6 text-gray-800 sm:px-5">
                <p className="whitespace-pre-wrap break-words">{post.body}</p>
              </div>
            )}

            {/* ORIGINAL POST CARD */}
            {originalPost ? (
              <div className="mx-4 my-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:mx-5">
                <div className="flex items-center gap-3 bg-[#f8fafc] px-4 py-3">
                  <img
                    src={originalPost.user?.photo}
                    alt={originalPost.user?.name ?? "Original author"}
                    className="size-11 shrink-0 rounded-full bg-gray-100 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {originalPost.user?.name ?? "Original author"}
                      </span>

                      <span className="text-xs text-gray-500">
                        {originalPost.user?.username}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(originalPost.createdAt)}
                      {originalPost.privacy ? ` · ${originalPost.privacy}` : ""}
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                    Original post
                  </span>
                </div>

                {originalPost.body && (
                  <div className="px-4 py-4 text-sm leading-6 text-gray-800">
                    <p className="whitespace-pre-wrap break-words">
                      {originalPost.body}
                    </p>
                  </div>
                )}

                {originalPost.image && (
                  <div className="flex w-full items-center justify-center bg-[#101322]">
                    <img
                      src={originalPost.image}
                      alt="Original post attachment"
                      className={`block max-w-full object-contain ${
                        fullWidth ? "max-h-[650px]" : "max-h-[520px]"
                      }`}
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>{originalPost.likesCount ?? 0} likes</span>
                    <span>{originalPost.commentsCount ?? 0} comments</span>
                    <span>{originalPost.sharesCount ?? 0} shares</span>
                  </div>

                  {originalPostId && (
                    <Link
                      to={`/postDetailes/${originalPostId}`}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      View original post
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              /* NORMAL POST IMAGE */
              post.image &&
              (fullWidth ? (
                <div className="flex w-full items-center justify-center bg-[#101322]">
                  <img
                    src={post.image}
                    alt="Post attachment"
                    className="block max-h-[650px] max-w-full object-contain"
                  />
                </div>
              ) : (
                <img
                  src={post.image}
                  alt="Post attachment"
                  className="block max-h-[520px] w-full bg-gray-100 object-cover"
                />
              ))
            )}
          </>
        )}

        {/* POST COUNTS */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-gray-500 sm:px-5">
          <button
            type="button"
            onClick={() => {
              if (likesCount > 0) {
                setShowLikesModal(true);
              }
            }}
            className="group flex cursor-pointer items-center gap-2 rounded-lg"
          >
            <span className="flex size-[18px] items-center justify-center rounded-full bg-blue-600 text-white">
              <Heart fill="currentColor" size={11} />
            </span>

            <span className="text-xs text-gray-500 group-hover:text-blue-600 group-hover:underline">
              {likesCount} {likesCount === 1 ? "like" : "likes"}
            </span>
          </button>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <span>{commentsCount} comments</span>
            <span>{post.sharesCount ?? 0} shares</span>

            <Link
              to={`/postDetailes/${post._id}`}
              className="font-semibold text-blue-600 hover:underline"
            >
              View details
            </Link>
          </div>
        </div>

        {/* POST ACTIONS */}
        <div className="mx-4 flex items-center border-y border-gray-200 sm:mx-5">
          <button
            type="button"
            onClick={handleLike}
            disabled={busyAction}
            className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium transition hover:bg-gray-50 ${
              liked ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
            {liked ? "Liked" : "Like"}
          </button>

          <button
            type="button"
            onClick={focusCommentInput}
            className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <MessageCircle size={18} />
            Comment
          </button>

          <button
            type="button"
            onClick={handleShare}
            disabled={busyAction}
            className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>

        {/* COMMENTS SECTION */}
        <section className="px-4 pb-4 pt-4 sm:px-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Comments</h3>

              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                {commentsCount}
              </span>
            </div>

            <select
              value={commentSort}
              onChange={(e) =>
                setCommentSort(e.target.value as "relevant" | "newest")
              }
              aria-label="Sort comments"
              className="h-11 min-w-[145px] cursor-pointer rounded-xl border border-gray-200 bg-white px-4 pr-8 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500"
            >
              <option value="relevant">Most relevant</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {loadingComments ? (
            <div className="py-5 text-center text-sm text-gray-500">
              Loading comments...
            </div>
          ) : (
            <>
              {sortedComments.length > 0 ? (
                <div className="space-y-1">
                  {sortedComments.map((comment, index) =>
                    renderComment(
                      comment,
                      commentSort === "relevant" && index === 0,
                    ),
                  )}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-gray-400">
                  {commentsError
                    ? "Couldn't load comments."
                    : "No comments yet."}
                </p>
              )}

              {commentsError && allComments.length === 0 && (
                <button
                  type="button"
                  onClick={() => loadComments(1, false)}
                  className="mx-auto block text-sm font-semibold text-blue-600"
                >
                  Try again
                </button>
              )}

              {hasMoreComments && (
                <button
                  type="button"
                  onClick={handleMoreComments}
                  disabled={loadingMore}
                  className="mt-3 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Show more comments"}

                  <ChevronDown size={16} />
                </button>
              )}
            </>
          )}

          {commentEditError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {commentEditError}
            </div>
          )}

          <div id={`${commentInputId}-wrapper`}>
            <PostComment
              postId={post._id}
              getComments={async () => {
                setCommentsCount((count) => count + 1);
                await refreshComments();
              }}
            />
          </div>
        </section>
      </article>

      {/* DELETE POST DIALOG */}
      <AlertDialog isOpen={showDeleteDialog}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[400px]">
              <AlertDialog.CloseTrigger />

              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />
                <AlertDialog.Heading>Delete this post?</AlertDialog.Heading>
              </AlertDialog.Header>

              <AlertDialog.Body>
                <p>
                  This post will be permanently deleted. This action cannot be
                  undone.
                </p>
              </AlertDialog.Body>

              <AlertDialog.Footer>
                <Button
                  variant="tertiary"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>

                <Button variant="danger" onClick={deleteMyPost}>
                  Delete post
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>

      {/* DELETE COMMENT CONFIRMATION */}
      {commentToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-[460px] overflow-hidden rounded-[20px] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-5">
              <h2 className="text-lg font-bold text-slate-900">
                Confirm action
              </h2>

              <button
                type="button"
                onClick={() => setCommentToDelete(null)}
                disabled={deletingComment}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-start gap-4 px-5 py-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Trash2 size={21} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Delete this comment?
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  This comment will be permanently removed.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setCommentToDelete(null)}
                disabled={deletingComment}
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteComment}
                disabled={deletingComment}
                className="rounded-xl bg-[#f50046] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {deletingComment ? "Deleting..." : "Delete comment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PEOPLE WHO REACTED MODAL */}
      {showLikesModal && (
        <PostLikesModal
          postId={post._id}
          onClose={() => setShowLikesModal(false)}
        />
      )}
    </>
  );
}
