
import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";

export type TokencontextType = {
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
};

export const Tokencontext =
  createContext<TokencontextType | null>(null);

export function useTokenContext(): TokencontextType {
  const context = useContext(Tokencontext);

  if (context === null) {
    throw new Error(
      "useTokenContext must be used inside TokencontextProvider"
    );
  }

  return context;
}


