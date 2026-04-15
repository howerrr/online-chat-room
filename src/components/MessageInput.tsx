"use client";

import { useRef } from "react";
import { useVoiceInputInput } from "./VoiceInput";

export default function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isListening, toggleListening, stopListening, resetTranscript } = useVoiceInputInput(inputRef);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputRef.current?.value || "";
    if (text.trim()) {
      onSend(text.slice(0, 500));
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
    // Stop voice listening and reset transcript after send
    if (isListening) {
      stopListening();
    }
    resetTranscript();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 flex gap-2 items-center"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <button
        type="button"
        onClick={toggleListening}
        className="p-2 rounded-lg transition-all duration-200 relative"
        style={{
          backgroundColor: isListening ? "#ef4444" : "var(--card)",
          border: "1px solid var(--border)",
          color: isListening ? "white" : "var(--foreground)",
        }}
        title={isListening ? "Click to stop listening" : "Click to start voice input"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={isListening ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
        {isListening && (
          <span
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping"
          />
        )}
      </button>

      <input
        ref={inputRef}
        type="text"
        maxLength={500}
        placeholder="Type a message..."
        className="flex-1 px-4 py-3 rounded-xl outline-none transition-all duration-200"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />

      <button
        type="submit"
        className="px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: "linear-gradient(135deg, var(--primary), #818cf8)",
          color: "white",
        }}
      >
        Send
      </button>
    </form>
  );
}
