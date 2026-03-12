"use client";
import { useContext } from "react";
import { SessionContext } from "./context/session.context";
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("no context useSession must be used within a SessionProvider");
  }

  return context;
};
