
import axios from "axios";

const baseurl = import.meta.env.VITE_BASE_URL;

export async function getPostLikes(
  postId: string,
  page = 1,
  limit = 20
) {
  const response = await axios.get(
    `${baseurl}/posts/${postId}/likes`,
    {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    }
  );

  return response.data;
}
