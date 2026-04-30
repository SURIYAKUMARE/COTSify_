import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import ClientOnlyWidgets from "@/components/ClientOnlyWidgets";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "COTsify – Smart Component Sourcing",
  description: "Identify, locate, and compare components for any technical project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-950 text-white antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <ClientOnlyWidgets />
            <Navbar />
            <main className="relative z-10">{children}</main>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
