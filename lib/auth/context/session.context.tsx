"use client";
import { useEffect, createContext, useState, useCallback } from "react";
import { getSessionAction } from "../../actions/auth.action";
import { cartItemQty } from "@/lib/actions/cart.action";
import { SessionResult } from "@/types";
type SessionContextType = {
  data: SessionResult | null;
  loading: boolean;
  error: string;
  cartQty: number;
  fetchSession: () => void;
  refreshCart: () => void;
};

export const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [data, setData] = useState({});
  const [cartQty, setCartQty] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const refreshCart = useCallback(async () => {
    const qty = await cartItemQty();
    setCartQty(qty ?? 0);
  }, []);
  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const user = await getSessionAction();
      if (!user?.success) {
        setData(null);
        setError("user not found");
      } else {
        setData(user);
      }
    } catch (err) {
      setError("something failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchSession();
    refreshCart();
  }, []);
  return (
    <SessionContext.Provider
      value={{ data, loading, error, fetchSession, cartQty, refreshCart }}>
      {children}
    </SessionContext.Provider>
  );
};
