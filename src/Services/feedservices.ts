
import axios from "axios";

const baseurl = import.meta.env.VITE_BASE_URL;

export async function getUserFeed() {
  return axios.get(`${baseurl}/posts?limit=30`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
}

export async function getAllPost() {
  return axios.get(`${baseurl}/posts?limit=30`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });
}

export type CollectionMode = "posts" | "saved" | "community";


export async function getCollectionPosts(
  mode: CollectionMode,
  page = 1
) {
  const endpoint =
    mode === "saved"
      ? `${baseurl}/users/bookmarks`
      : mode === "community"
        ? `${baseurl}/posts`
        : `${baseurl}/posts/feed`;

  const params =
    mode === "posts"
      ? { only: "me", page, limit: 20 }
      : { page, limit: 20 };

  const response = await axios.get(endpoint, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
    params,
  });

  return response.data;
}

