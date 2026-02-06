"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

type UserContextType = {
  user: { id: string; email: string } | null;
  loading: boolean;
  error: string | null;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        if (user) {
          setUser({ id: user.id, email: user.email ?? "" });
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.error("Failed to fetch user:", err);
        setError(err.message || "Unknown error");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email ?? "" });
        } else {
          setUser(null);
        }
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
};
