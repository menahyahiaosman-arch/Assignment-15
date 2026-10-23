
import axios from "axios";

const baseurl = import.meta.env.VITE_BASE_URL;

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
  };
}

export async function getPostComments(
  postId: string,
  page = 1,
  limit = 5
) {
  return axios.get(
    `${baseurl}/posts/${postId}/comments`,
    {
      headers: authHeaders(),
      params: {
        page,
        limit,
      },
    }
  );
}


export async function createPostComment(
  postId: string,
  formData: FormData
) {
  return axios.post(
    `${baseurl}/posts/${postId}/comments`,
    formData,
    {
      headers: authHeaders(),
    }
  );
}


export async function updatePostComment(
  postId: string,
  commentId: string,
  content: string
) {
  return axios.put(
    `${baseurl}/posts/${postId}/comments/${commentId}`,
    {
      content: content,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    }
  );
}


// Delete comment
// Endpoint assumed; needs confirmation from API
export async function deletePostComment(
  postId: string,
  commentId: string
) {
  return axios.delete(
    `${baseurl}/posts/${postId}/comments/${commentId}`,
    {
      headers: authHeaders(),
    }
  );
}


