
import { useState } from "react";
import type { FormEvent } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const isValid =
    currentPassword.length > 0 &&
    passwordPattern.test(newPassword) &&
    newPassword === confirmPassword;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!passwordPattern.test(newPassword)) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // The actual password-change API will be connected
    // after confirming its endpoint and request format.
    setLoading(true);

    try {
      toast.error(
        "Password update is not connected to the API yet."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-75px)] bg-[#f0f3f7] px-4 py-4 sm:py-5">
      <section className="mx-auto w-full max-w-[768px] rounded-[19px] border border-[#dce4ee] bg-white p-7 shadow-sm">
        <div className="mb-7 flex items-center gap-4">
          <div className="flex size-[46px] shrink-0 items-center justify-center rounded-full bg-[#e8f3ff] text-[#1477ff]">
            <KeyRound size={22} />
          </div>

          <div>
            <h1 className="text-[25px] font-extrabold tracking-tight text-[#0b1733]">
              Change Password
            </h1>

            <p className="mt-0.5 text-sm text-[#607798]">
              Keep your account secure by using a strong password.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="current-password"
              className="mb-2 block text-sm font-semibold text-[#122444]"
            >
              Current password
            </label>

            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              className="h-12 w-full rounded-xl border border-[#dce5ef] bg-[#f8fafc] px-4 text-sm text-[#122444] outline-none placeholder:text-[#91a1b8] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm font-semibold text-[#122444]"
            >
              New password
            </label>

            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              className="h-12 w-full rounded-xl border border-[#dce5ef] bg-[#f8fafc] px-4 text-sm text-[#122444] outline-none placeholder:text-[#91a1b8] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1.5 text-xs text-[#607798]">
              At least 8 characters with uppercase,
              lowercase, number, and special character.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-semibold text-[#122444]"
            >
              Confirm new password
            </label>

            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="h-12 w-full rounded-xl border border-[#dce5ef] bg-[#f8fafc] px-4 text-sm text-[#122444] outline-none placeholder:text-[#91a1b8] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#1976f3] text-sm font-bold text-white transition hover:bg-[#0964dd] disabled:cursor-not-allowed disabled:bg-[#75aaf5]"
          >
            {loading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Updating...
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
