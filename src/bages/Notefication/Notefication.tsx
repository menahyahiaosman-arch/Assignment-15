
import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  Heart,
  Loader2,
  MessageCircle,
  Repeat2,
  UserRoundPlus,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../Services/notification.services";

type Person = {
  _id?: string;
  name?: string;
  photo?: string;
  username?: string;
};

type NotificationItem = {
  _id?: string;
  id?: string;
  type?: string;
  message?: string;
  text?: string;
  content?: string;
  createdAt?: string;
  isRead?: boolean;
  read?: boolean;
  sender?: Person;
  user?: Person;
  actor?: Person;
  fromUser?: Person;
};

type FilterType = "all" | "unread";

const LIMIT = 10;

function getNotificationId(item: NotificationItem) {
  return item._id ?? item.id;
}

function isNotificationRead(item: NotificationItem) {
  return Boolean(item.isRead ?? item.read);
}

function getRelativeTime(value?: string) {
  if (!value) return "";

  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - time) / 1000)
  );

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600)
    return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400)
    return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800)
    return `${Math.floor(seconds / 86400)}d`;

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getNotificationIcon(type?: string) {
  const value = (type ?? "").toLowerCase();

  if (value.includes("follow")) {
    return UserRoundPlus;
  }

  if (value.includes("comment") || value.includes("reply")) {
    return MessageCircle;
  }

  if (value.includes("share")) {
    return Repeat2;
  }

  if (value.includes("like")) {
    return Heart;
  }

  return Bell;
}

function getNotificationText(
  item: NotificationItem,
  actorName: string
) {
  const message =
    item.message ?? item.text ?? item.content;

  if (message?.trim()) return message;

  const type = (item.type ?? "").toLowerCase();

  if (type.includes("follow")) {
    return "followed you";
  }

  if (type.includes("comment")) {
    return "commented on your post";
  }

  if (type.includes("reply")) {
    return "replied to your comment";
  }

  if (type.includes("share")) {
    return "shared your post";
  }

  if (type.includes("like")) {
    return "liked your post";
  }

  return actorName
    ? "sent you a notification"
    : "You have a new notification";
}

export default function Notefication() {
  const queryClient = useQueryClient();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  async function refreshUnreadCount() {
    try {
      const { data } =
        await getUnreadNotificationsCount();

      const payload = data?.data;

      const count =
        typeof payload === "number"
          ? payload
          : payload?.count ??
            payload?.unreadCount ??
            data?.count ??
            0;

      setUnreadCount(Number(count) || 0);
    } catch {
      // Keep the last known count.
    }

    await queryClient.invalidateQueries({
      queryKey: ["notificationsUnreadCount"],
    });
  }

  async function loadNotifications(
    pageNumber = 1,
    append = false
  ) {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError("");
    }

    try {
      const { data } = await getNotifications(
        pageNumber,
        LIMIT
      );

      const payload = data?.data;

      const list: NotificationItem[] =
        Array.isArray(payload)
          ? payload
          : payload?.notifications ??
            payload?.items ??
            [];

      const pagination =
        data?.meta?.pagination ??
        payload?.pagination;

      setItems((current) => {
        if (!append) return list;

        const combined = [...current, ...list];
        const seen = new Set<string>();

        return combined.filter((item) => {
          const id = getNotificationId(item);

          if (!id) return true;
          if (seen.has(id)) return false;

          seen.add(id);
          return true;
        });
      });

      setPage(pageNumber);

      if (
        typeof pagination?.numberOfPages === "number"
      ) {
        setHasMore(
          pageNumber < pagination.numberOfPages
        );
      } else if (
        typeof pagination?.hasNextPage === "boolean"
      ) {
        setHasMore(pagination.hasNextPage);
      } else if (
        pagination?.nextPage !== undefined
      ) {
        setHasMore(pagination.nextPage !== null);
      } else {
        setHasMore(list.length === LIMIT);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Could not load notifications";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    void loadNotifications(1, false);
    void refreshUnreadCount();
  }, []);

  async function markOne(item: NotificationItem) {
    const id = getNotificationId(item);

    if (
      !id ||
      isNotificationRead(item) ||
      markingId
    ) {
      return;
    }

    setMarkingId(id);

    try {
      await markNotificationRead(id);

      setItems((current) =>
        current.map((notification) =>
          getNotificationId(notification) === id
            ? {
                ...notification,
                isRead: true,
                read: true,
              }
            : notification
        )
      );

      setUnreadCount((count) =>
        Math.max(0, count - 1)
      );

      await refreshUnreadCount();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Could not mark notification as read"
      );
    } finally {
      setMarkingId(null);
    }
  }

  async function markAll() {
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);

    try {
      const { data } =
        await markAllNotificationsRead();

      setItems((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          read: true,
        }))
      );

      setUnreadCount(0);

      toast.success(
        data?.message ||
          "All notifications marked as read"
      );

      await refreshUnreadCount();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Could not update notifications"
      );
    } finally {
      setMarkingAll(false);
    }
  }

  const visibleItems =
    filter === "unread"
      ? items.filter((item) => !isNotificationRead(item))
      : items;

  return (
    <main className="min-h-screen bg-[#eef2f7] px-3 py-[18px] sm:px-6">
      <section className="mx-auto w-full max-w-[1200px] overflow-hidden rounded-[20px] border border-[#dce5f1] bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-[#e2e8f0] px-6 pb-6 pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[27px] font-extrabold tracking-tight text-[#0b1733]">
                Notifications
              </h1>

              <p className="mt-1 text-[15px] text-[#607798]">
                Realtime updates for likes, comments,
                shares, and follows.
              </p>
            </div>

            <button
              type="button"
              onClick={markAll}
              disabled={
                markingAll ||
                unreadCount === 0
              }
              className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-[#dce5f1] bg-[#f8fafc] px-4 text-sm font-semibold text-[#233c61] transition hover:bg-[#edf4ff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <CheckCheck size={18} />
              )}

              Mark all as read
            </button>
          </div>

          {/* Filters */}
          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                filter === "all"
                  ? "bg-[#1e7af5] text-white"
                  : "bg-[#f1f5f9] text-[#243b5a] hover:bg-[#e7eef8]"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`inline-flex items-center gap-3 rounded-full px-5 py-2 text-sm font-semibold transition ${
                filter === "unread"
                  ? "bg-[#1e7af5] text-white"
                  : "bg-[#f1f5f9] text-[#243b5a] hover:bg-[#e7eef8]"
              }`}
            >
              Unread

              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  filter === "unread"
                    ? "bg-white text-blue-600"
                    : "bg-white text-[#1e7af5]"
                }`}
              >
                {unreadCount}
              </span>
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="space-y-[10px] px-5 py-5">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-[#607798]">
              <Loader2
                size={23}
                className="animate-spin"
              />
              Loading notifications...
            </div>
          ) : error && items.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  loadNotifications(1, false)
                }
                className="mt-3 font-semibold text-blue-600"
              >
                Try again
              </button>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="py-16 text-center">
              <Bell
                size={38}
                className="mx-auto mb-3 text-[#a4b4c9]"
              />

              <p className="font-bold text-[#152746]">
                {filter === "unread"
                  ? "No unread notifications"
                  : "You're all caught up"}
              </p>

              <p className="mt-1 text-sm text-[#607798]">
                {filter === "unread"
                  ? "Your unread notifications will appear here."
                  : "New activity will show up here."}
              </p>
            </div>
          ) : (
            visibleItems.map((item, index) => {
              const id =
                getNotificationId(item) ??
                `notification-${index}`;

              const read = isNotificationRead(item);

              const actor =
                item.actor ??
                item.sender ??
                item.fromUser ??
                item.user;

              const actorName = actor?.name ?? "";

              const message = getNotificationText(
                item,
                actorName
              );

              const Icon = getNotificationIcon(
                item.type
              );

              const isFollow = (
                item.type ?? ""
              )
                .toLowerCase()
                .includes("follow");

              return (
                <article
                  key={id}
                  className={`relative min-h-[134px] rounded-[19px] border px-5 py-5 transition ${
                    read
                      ? "border-[#e4e9f0] bg-white"
                      : "border-[#d5e5ff] bg-[#eaf2ff]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <span className="grid size-[52px] place-items-center overflow-hidden rounded-full bg-white text-[#58708d]">
                        {actor?.photo ? (
                          <img
                            src={actor.photo}
                            alt={actorName}
                            className="size-full object-cover"
                          />
                        ) : (
                          <Icon size={23} />
                        )}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-[15px] leading-6 text-[#122444]">
                          {actorName && (
                            <strong className="font-extrabold">
                              {actorName}{" "}
                            </strong>
                          )}

                          {message}
                        </p>

                        <div className="flex shrink-0 items-center gap-4">
                          <span className="text-xs text-[#607798]">
                            {getRelativeTime(
                              item.createdAt
                            )}
                          </span>

                          {!read && (
                            <span className="size-[5px] rounded-full bg-[#1e7af5]" />
                          )}
                        </div>
                      </div>

                      {actorName && (
                        <p className="mt-1 text-[15px] text-[#607798]">
                          {actorName}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className={`grid size-7 place-items-center rounded-full bg-white ${
                            isFollow
                              ? "text-[#8b3dff]"
                              : "text-[#1e7af5]"
                          }`}
                        >
                          <Icon size={17} />
                        </span>

                        {!read && (
                          <button
                            type="button"
                            onClick={() =>
                              void markOne(item)
                            }
                            disabled={
                              markingId === id
                            }
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#d4e4ff] bg-white px-3 text-xs font-semibold text-[#1674f8] transition hover:bg-blue-50 disabled:opacity-50"
                          >
                            {markingId === id ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Check size={14} />
                            )}

                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {!loading && hasMore && (
            <button
              type="button"
              onClick={() =>
                loadNotifications(page + 1, true)
              }
              disabled={loadingMore}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce5f1] bg-[#f8fafc] py-3 text-sm font-semibold text-[#1e7af5] transition hover:bg-[#edf4ff] disabled:opacity-50"
            >
              {loadingMore ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <ChevronDown size={17} />
              )}

              {loadingMore
                ? "Loading..."
                : "Load more notifications"}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}


