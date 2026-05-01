"use client";
import dynamic from "next/dynamic";

const AntiGravityBackground = dynamic(
  () => import("@/components/AntiGravityBackground").catch(() => ({ default: () => null })),
  { ssr: false, loading: () => null }
);

const ChatWidget = dynamic(
  () => import("@/components/ChatWidget").catch(() => ({ default: () => null })),
  { ssr: false, loading: () => null }
);

export default function ClientOnlyWidgets() {
  return (
    <>
      <AntiGravityBackground />
      <ChatWidget />
    </>
  );
}
