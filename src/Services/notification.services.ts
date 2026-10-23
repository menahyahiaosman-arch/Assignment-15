
import axios from "axios";

const baseurl = import.meta.env.VITE_BASE_URL;

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
  };
}

export function getNotifications(
  page = 1,
  limit = 10
) {
  return axios.get(`${baseurl}/notifications`, {
    headers: authHeaders(),
    params: { page, limit },
  });
}

export function getUnreadNotificationsCount() {
  return axios.get(
    `${baseurl}/notifications/unread-count`,
    {
      headers: authHeaders(),
    }
  );
}

export function markNotificationRead(
  notificationId: string
) {
  return axios.patch(
    `${baseurl}/notifications/${notificationId}/read`,
    {},
    {
      headers: authHeaders(),
    }
  );
}

export function markAllNotificationsRead() {
  return axios.patch(
    `${baseurl}/notifications/read-all`,
    {},
    {
      headers: authHeaders(),
    }
  );
}

// Aliases for compatibility with other components
export const markNotificationAsRead =
  markNotificationRead;

export const markAllNotificationsAsRead =
  markAllNotificationsRead;


