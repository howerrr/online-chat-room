"use client";

import { useEffect, useRef } from "react";
import VoicePlayback from "./VoicePlayback";

type Message = {
  id: string;
  username: string;
  text: string;
  timestamp: number;
};

type SystemMessage = {
  type: "join" | "leave";
  username: string;
};

type ChatMessage = Message | SystemMessage;

function isSystemMessage(msg: ChatMessage): msg is SystemMessage {
  return "type" in msg;
}

export default function MessageList({
  messages,
  currentUserId,
}: {
  messages: ChatMessage[];
  currentUserId: string | null;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto p-4 space-y-3"
      style={{ scrollBehavior: "smooth" }}
    >
      {messages.map((msg, index) => {
        if (isSystemMessage(msg)) {
          return (
            <div
              key={`system-${index}`}
              className="text-center text-sm italic py-2"
              style={{ color: "var(--muted)" }}
            >
              {msg.username} {msg.type === "join" ? "joined" : "left"} the room
            </div>
          );
        }

        const isOwn = msg.id === currentUserId;
        return (
          <div
            key={`msg-${msg.timestamp}-${index}`}
            className={`max-w-[80%] ${isOwn ? "ml-auto" : "mr-auto"}`}
          >
            <div
              className="px-4 py-2 rounded-2xl"
              style={
                isOwn
                  ? {
                      background: "linear-gradient(135deg, var(--primary), #818cf8)",
                      color: "white",
                      borderBottomRightRadius: "4px",
                    }
                  : {
                      backgroundColor: "var(--card)",
                      color: "var(--foreground)",
                      border: "1px solid var(--border)",
                      borderBottomLeftRadius: "4px",
                    }
              }
            >
              {!isOwn && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: "var(--secondary)" }}>
                    {msg.username}
                  </span>
                  <VoicePlayback text={msg.text} />
                </div>
              )}
              <div className="text-sm break-words">{msg.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
