"use client";

import { useState, useRef, useCallback } from "react";

export function useVoiceInputInput(ref: React.RefObject<HTMLInputElement | null>) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef("");

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "zh-CN";

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i][0].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Build complete text: existing final + new final + interim
        const baseText = finalTranscriptRef.current;
        const completeText = baseText + finalTranscript + interimTranscript;

        // Update input
        if (ref.current) {
          ref.current.value = completeText;
        }

        // Update final transcript ref
        finalTranscriptRef.current = baseText + finalTranscript;
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        isListeningRef.current = false;
      };

      recognitionRef.current.onend = () => {
        if (isListeningRef.current) {
          try {
            recognitionRef.current?.start();
          } catch {
            setIsListening(false);
            isListeningRef.current = false;
          }
        }
      };
    }

    try {
      finalTranscriptRef.current = ref.current?.value || "";
      recognitionRef.current?.start();
      setIsListening(true);
      isListeningRef.current = true;
    } catch {
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [ref]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsListening(false);
    // Note: We do NOT clear finalTranscriptRef - input keeps its content
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
  }, []);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  return {
    isListening,
    toggleListening,
    startListening,
    stopListening,
    resetTranscript,
  };
}
