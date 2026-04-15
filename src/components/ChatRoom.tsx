"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import UserList from "./UserList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ThemeToggle from "./ThemeToggle";

type User = {
  id: string;
  username: string;
};

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

export default function ChatRoom({ room }: { room: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [error, setError] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const router = useRouter();
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  const triggerApi = useCallback(async (event: string, data: any) => {
    try {
      await fetch("/api/pusher-trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, room, data }),
      });
    } catch (e) {
      console.error("API trigger error:", e);
    }
  }, [room]);

  const handleLeave = useCallback(async () => {
    // Send leave event via server
    if (currentUserId && currentUsername) {
      await triggerApi("leave", { id: currentUserId, username: currentUsername });
    }

    // Clear heartbeat
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    sessionStorage.removeItem("username");
    sessionStorage.removeItem("room");
    router.push("/");
  }, [currentUserId, currentUsername, triggerApi, router]);

  useEffect(() => {
    const username = sessionStorage.getItem("username");
    if (!username) {
      router.push("/");
      return;
    }

    setCurrentUsername(username);

    // Generate a unique ID for this user
    const userId = `${username}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setCurrentUserId(userId);

    // Don't add self immediately - wait to collect existing users via heartbeat
    setUsers([]);

    // Initialize Pusher
    const pusher = new Pusher("5df650ad7b1c47693739", {
      cluster: "us2",
    });
    pusherRef.current = pusher;

    // Subscribe to public room channel
    const channelName = `room-${room}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // Handle user joined (from server)
    channel.bind("join", (data: User) => {
      setUsers((prev) => {
        if (prev.find((u) => u.id === data.id)) return prev;
        return [...prev, data];
      });
      setMessages((prev) => [
        ...prev,
        { type: "join" as const, username: data.username },
      ]);
    });

    // Handle user left (from server)
    channel.bind("leave", (data: User) => {
      setUsers((prev) => prev.filter((u) => u.id !== data.id));
      setMessages((prev) => [
        ...prev,
        { type: "leave" as const, username: data.username },
      ]);
    });

    // Handle heartbeat - update online users list
    channel.bind("heartbeat", (data: User) => {
      setUsers((prev) => {
        if (prev.find((u) => u.id === data.id)) {
          // Update timestamp to track last seen
          return prev.map((u) => (u.id === data.id ? { ...u, ...data } : u));
        }
        return [...prev, data];
      });
    });

    // Handle messages
    channel.bind("message", (data: Message) => {
      // Add sender to users list if not already there
      setUsers((prev) => {
        if (prev.find((u) => u.id === data.id)) return prev;
        return [...prev, { id: data.id, username: data.username }];
      });
      setMessages((prev) => {
        // Avoid duplicates by timestamp + id
        if (prev.find((m) => "timestamp" in m && m.timestamp === data.timestamp && m.id === data.id)) {
          return prev;
        }
        return [...prev, data];
      });
    });

    // Set up heartbeat to keep presence alive (every 5 seconds)
    heartbeatRef.current = setInterval(async () => {
      if (userId && username) {
        await triggerApi("heartbeat", { id: userId, username });
      }
    }, 5000);

    // Wait for heartbeats from existing users before adding self
    // This allows new users to discover who's already online
    const collectionTimeout = setTimeout(() => {
      // After collecting heartbeats, add self to the list
      setUsers((prev) => {
        if (prev.find((u) => u.id === userId)) return prev;
        return [...prev, { id: userId, username }];
      });
      // Also send join event so others know we joined
      triggerApi("join", { id: userId, username });
    }, 3000);

    // Send initial join event
    const joinTimeout = setTimeout(async () => {
      await triggerApi("join", { id: userId, username });
    }, 500);

    return () => {
      clearTimeout(collectionTimeout);
      clearTimeout(joinTimeout);
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      // Send leave event on unmount
      if (userId && username) {
        triggerApi("leave", { id: userId, username });
      }
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [room, router, triggerApi]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const message: Message = {
        id: currentUserId,
        username: currentUsername,
        text: text.slice(0, 500),
        timestamp: Date.now(),
      };

      // Add to local messages immediately
      setMessages((prev) => [...prev, message]);

      // Also use trigger API for cross-client sync
      try {
        await fetch("/api/pusher-trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "message",
            room,
            data: message,
          }),
        });
      } catch (e) {
        console.error("Send error:", e);
      }
    },
    [currentUserId, currentUsername, room]
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden p-2 rounded-lg"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          <h1
            className="text-xl md:text-2xl font-bold"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Room {room}
          </h1>
          <span
            className="px-2 md:px-3 py-1 rounded-full text-xs font-medium hidden sm:inline-block"
            style={{
              backgroundColor: "var(--card)",
              color: "var(--success)",
              border: "1px solid var(--border)",
            }}
          >
            {users.length} online
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile online count */}
          <span
            className="sm:hidden px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: "var(--card)",
              color: "var(--success)",
              border: "1px solid var(--border)",
            }}
          >
            {users.length}
          </span>
          <ThemeToggle />
          <span
            className="px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm"
            style={{
              backgroundColor: "var(--card)",
              color: "var(--secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {currentUsername}
          </span>
          <button
            onClick={handleLeave}
            className="px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm transition-all duration-200 hover:scale-[1.02]"
            style={{
              backgroundColor: "transparent",
              color: "var(--muted)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.color = "var(--foreground)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--muted)";
            }}
          >
            Leave
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div
          className="text-center py-2 text-sm"
          style={{ backgroundColor: "#ef444420", color: "#ef4444" }}
        >
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {showSidebar && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-50 p-4 transform transition-transform duration-300
            ${showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
          style={{
            borderRight: "1px solid var(--border)",
            backgroundColor: "var(--background)",
            width: "200px",
          }}
        >
          <div className="flex justify-end mb-2 md:hidden">
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 rounded-lg"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </button>
          </div>
          <UserList users={users} />
        </aside>

        {/* Chat area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <MessageList messages={messages} currentUserId={currentUserId} />
          <MessageInput onSend={handleSendMessage} />
        </main>
      </div>
    </div>
  );
}