"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSupabaseClient } from "./supabase";

export interface AppUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  provider: "guest" | "supabase";
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInGuest: (email: string, password: string) => Promise<{ error?: string }>;
  signUpGuest: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInGuest: async () => ({}),
  signUpGuest: async () => ({}),
  signOut: async () => {},
});

const GUEST_KEY = "cotsify_guest_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabaseClient();

    if (sb) {
      // ── Supabase mode: read session + listen for changes ──────────────────
      sb.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            full_name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split("@")[0],
            avatar_url: session.user.user_metadata?.avatar_url,
            provider: "supabase",
          });
        } else {
          // Fall back to guest if no Supabase session
          loadGuest();
        }
        setLoading(false);
      });

      const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            full_name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split("@")[0],
            avatar_url: session.user.user_metadata?.avatar_url,
            provider: "supabase",
          });
        } else {
          loadGuest();
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // ── Guest mode: read from localStorage ───────────────────────────────
      loadGuest();
      setLoading(false);
    }
  }, []);

  const loadGuest = () => {
    try {
      const stored = localStorage.getItem(GUEST_KEY);
      if (stored) setUser(JSON.parse(stored));
      else setUser(null);
    } catch {
      setUser(null);
    }
  };

  const signUpGuest = async (email: string, password: string, fullName?: string) => {
    if (!email || !password) return { error: "Email and password required" };
    if (password.length < 6) return { error: "Password must be at least 6 characters" };
    const newUser: AppUser = {
      id: crypto.randomUUID(),
      email,
      full_name: fullName || email.split("@")[0],
      provider: "guest",
    };
    localStorage.setItem(GUEST_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return {};
  };

  const signInGuest = async (email: string, password: string) => {
    if (!email || !password) return { error: "Email and password required" };
    const stored = localStorage.getItem(GUEST_KEY);
    if (stored) {
      const existing: AppUser = JSON.parse(stored);
      if (existing.email === email) {
        setUser(existing);
        return {};
      }
    }
    const newUser: AppUser = {
      id: crypto.randomUUID(),
      email,
      full_name: email.split("@")[0],
      provider: "guest",
    };
    localStorage.setItem(GUEST_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return {};
  };

  const signOut = async () => {
    const sb = getSupabaseClient();
    if (sb) {
      await sb.auth.signOut();
    }
    localStorage.removeItem(GUEST_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInGuest, signUpGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
