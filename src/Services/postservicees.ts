import axios from "axios";
const baseurl = import.meta.env.VITE_BASE_URL;
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } });

export async function getsinglepost(postId: string) {
  return axios.get(`${baseurl}/posts/${postId}`, auth());
}
export async function createPost(formData: FormData) {
  return axios.post(`${baseurl}/posts`, formData, auth());
}
export async function updatePost(postId: string, formData: FormData) {
  return axios.put(`${baseurl}/posts/${postId}`, formData, auth());
}
export async function deletePost(postId: string) {
  return axios.delete(`${baseurl}/posts/${postId}`, auth());
}
export async function togglePostLike(postId: string) {
  return axios.put(`${baseurl}/posts/${postId}/like`, {}, auth());
}
export async function togglePostBookmark(postId: string) {
  return axios.put(`${baseurl}/posts/${postId}/bookmark`, {}, auth());
}
export async function sharePost(postId: string) {
  return axios.post(`${baseurl}/posts/${postId}/share`, {}, auth());
}
