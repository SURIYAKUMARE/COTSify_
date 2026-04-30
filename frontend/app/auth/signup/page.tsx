"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { Cpu, Loader2, Eye, EyeOff, Phone, Mail, ArrowRight } from "lucide-react";

type Mode = "email" | "phone";

export default function SignUpPage() {
  const router = useRouter();
  const { signUpGuest, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);
  const supabaseReady = isSupabaseConfigured();

  const [mode, setMode] = useState<Mode>("email");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signUpGuest(email, password, fullName);
    if (result.error) { setError(result.error); setLoading(false); }
    else router.push("/dashboard");
  };

  const handleGoogle = async () => {
    const sb = getSupabaseClient();
    if (!sb) { setError("Configure Supabase credentials to enable Google login."); return; }
    setLoading(true);
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone.trim()) { setError("Enter a valid phone number with country code."); return; }
    const sb = getSupabaseClient();
    if (!sb) { setError("Configure Supabase credentials to enable phone login."); return; }
    setLoading(true);
    const { error } = await sb.auth.signInWithOtp({ phone });
    if (error) { setError(error.message); setLoading(false); }
    else { setOtpSent(true); setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const sb = getSupabaseClient();
    if (!sb) return;
    setLoading(true);
    const { error } = await sb.auth.verifyOtp({ phone, token: otp, type: "sms" });
    if (error) { setError(error.message); setLoading(false); }
    else router.push("/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">COTsify</span>
          </div>
          <p className="text-gray-400">Create your account</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col gap-5">

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-900 font-medium py-2.5 rounded-xl transition-colors">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
            {!supabaseReady && <span className="text-xs text-gray-400 ml-1">(needs Supabase)</span>}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Mode toggle */}
          <div className="flex bg-gray-800 rounded-xl p-1 gap-1">
            <button onClick={() => { setMode("email"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "email" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}>
              <Mail className="w-4 h-4" /> Email
            </button>
            <button onClick={() => { setMode("phone"); setError(""); setOtpSent(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "phone" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}>
              <Phone className="w-4 h-4" /> Phone
            </button>
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          {/* Email form */}
          {mode === "email" && (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Full name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-600 transition-colors"
                  placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-600 transition-colors"
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-600 transition-colors pr-10"
                    placeholder="Min. 6 characters" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-950 font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Create account
              </button>
            </form>
          )}

          {/* Phone OTP */}
          {mode === "phone" && !otpSent && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Phone number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-600 transition-colors"
                  placeholder="+91 98765 43210" />
                <p className="text-xs text-gray-500 mt-1">Include country code (e.g. +91 for India)</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-950 font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                Send OTP
                {!supabaseReady && <span className="text-xs opacity-70">(needs Supabase)</span>}
              </button>
            </form>
          )}

          {mode === "phone" && otpSent && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <p className="text-white font-medium">OTP sent to {phone}</p>
                <p className="text-gray-400 text-sm mt-1">Enter the 6-digit code from your SMS</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">OTP Code</label>
                <input type="text" value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required maxLength={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-600 transition-colors text-center text-2xl tracking-widest font-mono"
                  placeholder="000000" />
              </div>
              <button type="submit" disabled={loading || otp.length < 6}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-950 font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Verify & Sign up
              </button>
              <button type="button" onClick={() => { setOtpSent(false); setOtp(""); }}
                className="text-sm text-gray-500 hover:text-gray-300 text-center">
                ← Change number
              </button>
            </form>
          )}

          <p className="text-center text-gray-500 text-sm">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-cyan-400 hover:text-cyan-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
