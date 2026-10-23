
import axios from "axios";

const baseurl = import.meta.env.VITE_BASE_URL;

export async function uploadProfilePhoto(file: File) {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await axios.put(
    `${baseurl}/users/upload-photo`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    }
  );

  return response.data;
}
