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
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInGuest: async () => ({}),
  signUpGuest: async () => ({}),
  signOut: async () => {},
  updateProfile: async () => ({}),
});

const GUEST_KEY = "cotsify_guest_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const buildUser = (supaUser: any): AppUser => ({
    id: supaUser.id,
    email: supaUser.email || "",
    full_name:
      supaUser.user_metadata?.full_name ||
      supaUser.user_metadata?.name ||
      supaUser.email?.split("@")[0],
    avatar_url: supaUser.user_metadata?.avatar_url,
    provider: "supabase",
  });

  useEffect(() => {
    const sb = getSupabaseClient();
    if (sb) {
      sb.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) setUser(buildUser(session.user));
        else loadGuest();
        setLoading(false);
      });
      const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
        if (session?.user) setUser(buildUser(session.user));
        else loadGuest();
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    } else {
      loadGuest();
      setLoading(false);
    }
  }, []);

  const loadGuest = () => {
    try {
      const stored = localStorage.getItem(GUEST_KEY);
      if (stored) setUser(JSON.parse(stored));
      else setUser(null);
    } catch { setUser(null); }
  };

  const updateProfile = async (data: { full_name?: string; avatar_url?: string }) => {
    if (!user) return { error: "Not signed in" };

    if (user.provider === "supabase") {
      const sb = getSupabaseClient();
      if (!sb) return { error: "Supabase not configured" };
      const { data: updated, error } = await sb.auth.updateUser({
        data: {
          full_name: data.full_name,
          avatar_url: data.avatar_url,
        },
      });
      if (error) return { error: error.message };
      if (updated.user) setUser(buildUser(updated.user));
      return {};
    } else {
      // Guest mode — update localStorage
      const updated: AppUser = { ...user, ...data };
      localStorage.setItem(GUEST_KEY, JSON.stringify(updated));
      setUser(updated);
      return {};
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
      if (existing.email === email) { setUser(existing); return {}; }
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
    if (sb) await sb.auth.signOut();
    localStorage.removeItem(GUEST_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInGuest, signUpGuest, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
