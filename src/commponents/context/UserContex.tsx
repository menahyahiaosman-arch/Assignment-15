
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import type { userProfileType } from "../../Types/user.types";
import { getMyProfile } from "../../Services/Profile.sevices";
import { useTokenContext } from "./Tokencontext";

export type UserContextType = {
  userDetails: userProfileType | null;
  setuserDetails: Dispatch<
    SetStateAction<userProfileType | null>
  >;
};

export const UserContext =
  createContext<UserContextType | null>(null);

export function useUserContext(): UserContextType {
  const context = useContext(UserContext);

  if (context === null) {
    throw new Error(
      "useUserContext must be used inside UserContexProvider"
    );
  }

  return context;
}

export default function UserContexProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { token } = useTokenContext();

  const [userDetails, setuserDetails] =
    useState<userProfileType | null>(null);

  useEffect(() => {
    if (!token) {
      setuserDetails(null);
      return;
    }

    async function getUserProfile() {
      try {
        const { data } = await getMyProfile();
        setuserDetails(data.data.user);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    }

    void getUserProfile();
  }, [token]);

  return (
    <UserContext.Provider
      value={{ userDetails, setuserDetails }}
    >
      {children}
    </UserContext.Provider>
  );
}

