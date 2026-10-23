import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useTokenContext } from "../context/Tokencontext";


export default function AuthProtectedRoutes({
  children,
}: {
  children: ReactNode;
}) {

  const { token } = useTokenContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);
  return <>{children}</>;
}
