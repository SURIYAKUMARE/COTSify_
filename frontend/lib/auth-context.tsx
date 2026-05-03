"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSupabaseClient } from "./supabase";

export interface AppUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
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
  user: null, loading: true,
  signInGuest: async () => ({}),
  signUpGuest: async () => ({}),
  signOut: async () => {},
  updateProfile: async () => ({}),
});

const GUEST_KEY = "cotsify_guest_user";
const SUPABASE_USER_KEY = "cotsify_supabase_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const buildUser = (supaUser: any): AppUser => {
    const u: AppUser = {
      id: supaUser.id,
      email: supaUser.email || supaUser.phone || "",
      full_name:
        supaUser.user_metadata?.full_name ||
        supaUser.user_metadata?.name ||
        supaUser.user_metadata?.email?.split("@")[0] ||
        supaUser.email?.split("@")[0] ||
        "User",
      avatar_url:
        supaUser.user_metadata?.avatar_url ||
        supaUser.user_metadata?.picture,
      phone: supaUser.phone,
      provider: "supabase",
    };
    // Persist to localStorage so profile page always has data
    try { localStorage.setItem(SUPABASE_USER_KEY, JSON.stringify(u)); } catch {}
    return u;
  };

  useEffect(() => {
    const sb = getSupabaseClient();
    if (sb) {
      // First check localStorage cache for instant load
      try {
        const cached = localStorage.getItem(SUPABASE_USER_KEY);
        if (cached) setUser(JSON.parse(cached));
      } catch {}

      sb.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(buildUser(session.user));
        } else {
          // Clear supabase cache, try guest
          try { localStorage.removeItem(SUPABASE_USER_KEY); } catch {}
          loadGuest();
        }
        setLoading(false);
      }).catch(() => {
        loadGuest();
        setLoading(false);
      });

      const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setUser(buildUser(session.user));
        } else {
          try { localStorage.removeItem(SUPABASE_USER_KEY); } catch {}
          if (event === "SIGNED_OUT") setUser(null);
          else loadGuest();
        }
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
      const { data: updated, error } = await sb.auth.updateUser({ data });
      if (error) return { error: error.message };
      if (updated.user) setUser(buildUser(updated.user));
      return {};
    } else {
      const updated: AppUser = { ...user, ...data };
      try { localStorage.setItem(GUEST_KEY, JSON.stringify(updated)); } catch {}
      setUser(updated);
      return {};
    }
  };

  const signUpGuest = async (email: string, password: string, fullName?: string) => {
    if (!email || !password) return { error: "Email and password required" };
    if (password.length < 6) return { error: "Password must be at least 6 characters" };
    const newUser: AppUser = {
      id: crypto.randomUUID(), email,
      full_name: fullName || email.split("@")[0],
      provider: "guest",
    };
    try { localStorage.setItem(GUEST_KEY, JSON.stringify(newUser)); } catch {}
    setUser(newUser);
    return {};
  };

  const signInGuest = async (email: string, password: string) => {
    if (!email || !password) return { error: "Email and password required" };
    try {
      const stored = localStorage.getItem(GUEST_KEY);
      if (stored) {
        const existing: AppUser = JSON.parse(stored);
        if (existing.email === email) { setUser(existing); return {}; }
      }
    } catch {}
    const newUser: AppUser = {
      id: crypto.randomUUID(), email,
      full_name: email.split("@")[0],
      provider: "guest",
    };
    try { localStorage.setItem(GUEST_KEY, JSON.stringify(newUser)); } catch {}
    setUser(newUser);
    return {};
  };

  const signOut = async () => {
    const sb = getSupabaseClient();
    if (sb) { try { await sb.auth.signOut(); } catch {} }
    try {
      localStorage.removeItem(GUEST_KEY);
      localStorage.removeItem(SUPABASE_USER_KEY);
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInGuest, signUpGuest, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
