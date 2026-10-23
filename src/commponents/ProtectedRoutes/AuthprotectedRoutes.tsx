import React, { useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Tokencontext } from "../context/Tokencontext";


export default function AuthProtectedRoutes({
  children,
}: {
  children: ReactNode;
}) {

  const {token} = useContext(Tokencontext)
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);
  return <>{children}</>;
}
