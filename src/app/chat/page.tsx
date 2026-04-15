"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ChatRoom from "@/components/ChatRoom";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const room = searchParams.get("room") || "1";

  return <ChatRoom room={room} />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ color: "var(--foreground)" }}>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
