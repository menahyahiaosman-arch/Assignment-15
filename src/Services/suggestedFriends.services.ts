
import axios from "axios";

const baseurl = import.meta.env.VITE_BASE_URL;

const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
  },
});

export type SuggestedFriend = {
  _id: string;
  name: string;
  username: string;
  photo: string;
  followersCount?: number;
  isFollowing?: boolean;
};

export async function getSuggestedFriends(
  page = 1,
  limit = 20
): Promise<SuggestedFriend[]> {
  const response = await axios.get(
    `${baseurl}/users/suggestions`,
    {
      ...auth(),
      params: { page, limit },
    }
  );

  const suggestions = response.data?.data?.suggestions;

  return Array.isArray(suggestions) ? suggestions : [];
}

export async function followUser(userId: string) {
  const response = await axios.put(
    `${baseurl}/users/${userId}/follow`,
    {},
    auth()
  );

  return response.data;
}




