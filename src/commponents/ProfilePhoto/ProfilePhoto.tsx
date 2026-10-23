
import { useRef, useState } from "react";
import { Camera, Expand, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { uploadProfilePhoto } from "../../Services/profilePhoto.services";

type Props = {
  photo?: string;
  name?: string;
};

export default function ProfilePhoto({ photo, name }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [preview, setPreview] = useState<string | null>(null);
  const [showFullImage, setShowFullImage] = useState(false);

  const currentPhoto = preview || photo || "";

  const uploadMutation = useMutation({
    mutationFn: uploadProfilePhoto,

    onSuccess: async () => {
      toast.success("Profile photo updated successfully");

      await queryClient.invalidateQueries({
        queryKey: ["userDetails"],
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update profile photo"
      );
      setPreview(null);
    },
  });

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5 MB");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPreview(reader.result as string);
    };

    reader.readAsDataURL(file);

    uploadMutation.mutate(file);

    event.target.value = "";
  }

  return (
    <>
      <div className="group relative cursor-pointer size-[145px] shrink-0">
        {/* PROFILE IMAGE */}
        <img
          src={currentPhoto}
          alt={name || "Profile"}
          className="size-full rounded-full border-4 border-white bg-gray-100 object-cover shadow-sm ring-2 ring-blue-100"
        />

        {/* HOVER BUTTONS */}
        <div className=" absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-8 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setShowFullImage(true)}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-blue-100 bg-white text-blue-600 shadow-md transition hover:bg-blue-50"
            title="View photo"
          >
            <Expand size={19} />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
            title="Change photo"
          >
            <Camera size={19} />
          </button>
        </div>

        {/* HIDDEN FILE INPUT */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* FULL IMAGE MODAL */}
      {showFullImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-5"
          onClick={() => setShowFullImage(false)}
        >
          <button
            type="button"
            onClick={() => setShowFullImage(false)}
            className="absolute right-6 top-6 cursor-pointer rounded-full bg-white/15 p-3 text-white hover:bg-white/25"
          >
            <X size={24} />
          </button>

          <img
            src={currentPhoto}
            alt={name || "Profile"}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
          />
        </div>
      )}
    </>
  );
}
