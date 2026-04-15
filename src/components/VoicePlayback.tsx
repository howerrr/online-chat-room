"use client";

import { useState, useCallback, useRef } from "react";

interface VoicePlaybackProps {
  text: string;
}

export default function VoicePlayback({ text }: VoicePlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const play = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    // Stop any ongoing speech first (interrupt)
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={isPlaying ? stop : play}
      className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
      style={{
        backgroundColor: isPlaying ? "var(--primary)" : "transparent",
        color: isPlaying ? "white" : "var(--muted)",
        border: "1px solid transparent",
      }}
      title={isPlaying ? "Stop" : "Read aloud"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isPlaying ? (
          <>
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </>
        ) : (
          <>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </>
        )}
      </svg>
    </button>
  );
}
