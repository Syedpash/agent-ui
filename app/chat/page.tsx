"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

// Message shape — each chat bubble is one of these
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Chat page — the main UI for talking to the AI Agent
export default function ChatPage() {
  const { username, logout, isLoading } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null); // auto-scroll anchor

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !username) {
      router.push("/login");
    }
  }, [username, isLoading, router]);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message to the agent
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput("");
    setError("");

    // Add user message to UI immediately (optimistic update)
    const userMsg: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      // POST /agent/chat — JWT is attached automatically by Axios interceptor
      const response = await api.post("/agent/chat", { message: userMessage });

      const assistantMsg: Message = {
        role: "assistant",
        content: response.data.response,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to get response. Is the server running?");
    } finally {
      setIsSending(false);
    }
  };

  // Clear conversation history
  const clearHistory = async () => {
    try {
      await api.post("/agent/clear");
      setMessages([]);
      setError("");
    } catch {
      setError("Failed to clear history");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-lg">AI Agent</h1>
          <p className="text-gray-400 text-sm">Logged in as <span className="text-blue-400">{username}</span></p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={clearHistory}
            className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-gray-600 hover:border-gray-400 transition-colors"
          >
            Clear History
          </button>
          <button
            onClick={logout}
            className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded border border-red-800 hover:border-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl w-full mx-auto">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-2xl mb-2">👋</p>
            <p className="font-medium text-gray-400">Start a conversation</p>
            <p className="text-sm mt-1">Try: "calculate 25 * 48" or "search Java streams"</p>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-700 text-gray-100 rounded-bl-sm"
              }`}
            >
              {/* Role label */}
              <p className={`text-xs mb-1 ${msg.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                {msg.role === "user" ? username : "Agent"}
              </p>
              {/* Message content */}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              {/* Timestamp */}
              <p className={`text-xs mt-1 ${msg.role === "user" ? "text-blue-200" : "text-gray-500"}`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
              </div>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-4">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            placeholder='Try "calculate 10 * 5" or "search Java tutorial"'
            className="flex-1 bg-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-5 py-3 rounded-xl font-medium transition-colors disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
