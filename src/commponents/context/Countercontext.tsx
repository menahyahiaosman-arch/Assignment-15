import { createContext, useState, type ReactNode } from "react";
import { Countercontext } from "./Countercontext";

export default function Countercontextprovider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("userToken"),
  );
  return (
    <>
      <Countercontext.Provider value={{ token, setToken }}>
        {children}
      </Countercontext.Provider>
    </>
  );
}
