"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function JoinForm() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !room.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (username.length < 2 || username.length > 20) {
      setError("Username must be 2-20 characters");
      return;
    }

    const roomNum = parseInt(room, 10);
    if (isNaN(roomNum) || roomNum < 1 || roomNum > 9999) {
      setError("Room must be a number between 1 and 9999");
      return;
    }

    sessionStorage.setItem("username", username);
    sessionStorage.setItem("room", room);
    router.push(`/chat?room=${room}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div
        className="w-full max-w-md p-8 rounded-2xl"
        style={{ backgroundColor: "var(--card)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
      >
        <h1
          className="text-4xl font-bold text-center mb-2"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Chat Room
        </h1>
        <p className="text-center mb-8" style={{ color: "var(--muted)" }}>
          Join a room and start chatting
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              placeholder="Enter your username"
              className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-200"
              style={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label
              htmlFor="room"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Room Number
            </label>
            <input
              type="number"
              id="room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              min={1}
              max={9999}
              placeholder="Enter room number (1-9999)"
              className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-200"
              style={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: "#ef4444" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, var(--primary), #818cf8)",
              color: "white",
            }}
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}
