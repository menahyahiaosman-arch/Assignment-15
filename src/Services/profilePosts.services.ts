
import axios from "axios";
import type { PostCardI } from "../Types/postCard.types";

const baseurl = import.meta.env.VITE_BASE_URL;

const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
  },
});




export async function getMyPosts(userId: string) {
  const { data } = await axios.get(
    `${baseurl}/posts/feed`,
    {
      ...auth(),
      params: {
        only: "me",
        page: 1,
        limit: 20,
      },
    }
  );

  const posts: PostCardI[] = data?.data?.posts ?? [];

  return posts.filter(
    (post) => post.user?._id === userId
  );
}



export async function getSavedPosts(
  _bookmarkIds: string[] = []
) {
  const { data } = await axios.get(
    `${baseurl}/users/bookmarks`,
    {
      ...auth(),
      params: {
        page: 1,
        limit: 20,
      },
    }
  );

  const posts: PostCardI[] =
    data?.data?.posts ??
    data?.data?.bookmarks ??
    [];

  return posts;
}

