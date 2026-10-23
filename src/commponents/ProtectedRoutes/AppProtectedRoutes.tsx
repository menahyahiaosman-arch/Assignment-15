import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useTokenContext } from "../context/Tokencontext";


export default function AppProtectedRoutes({
  children,
}: {
  children: ReactNode;
}) {

  const { token } = useTokenContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/auth");
    }
  }, [token]);
  return <>{children}</>;
}
