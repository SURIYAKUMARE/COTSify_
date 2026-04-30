"use client";
import dynamic from "next/dynamic";

const AntiGravityBackground = dynamic(
  () => import("@/components/AntiGravityBackground"),
  { ssr: false }
);

const ChatWidget = dynamic(
  () => import("@/components/ChatWidget"),
  { ssr: false }
);

export default function ClientOnlyWidgets() {
  return (
    <>
      <AntiGravityBackground />
      <ChatWidget />
    </>
  );
}
