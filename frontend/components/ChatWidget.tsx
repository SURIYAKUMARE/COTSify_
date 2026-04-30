"use client";
import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import {
  MessageCircle, X, Send, Loader2, Bot, User,
  Minimize2, Maximize2, Trash2, Cpu, Sparkles,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "What components do I need for a smart irrigation system?",
  "Compare Arduino Uno vs ESP32",
  "How to connect DHT11 to Arduino?",
  "Cheapest way to build a line following robot",
  "What is the price of Raspberry Pi 4 in India?",
];

function formatMessage(text: string) {
  // Convert markdown-like formatting to JSX
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="font-bold text-white">{line.slice(2, -2)}</p>;
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return <li key={i} className="ml-4 list-disc text-gray-200">{line.slice(2)}</li>;
    }
    if (line.startsWith("# ")) {
      return <p key={i} className="font-bold text-cyan-400 text-base">{line.slice(2)}</p>;
    }
    if (line.match(/^\d+\./)) {
      return <li key={i} className="ml-4 list-decimal text-gray-200">{line.replace(/^\d+\.\s*/, "")}</li>;
    }
    if (line.trim() === "") return <br key={i} />;
    // Bold inline **text**
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="text-gray-200 leading-relaxed">
        {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part)}
      </p>
    );
  });
}

export default function ChatWidget({ projectContext }: { projectContext?: string }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am COTsify AI, your engineering assistant.\n\nI can help you:\n- Identify components for your project\n- Compare prices across platforms\n- Explain technical specifications\n- Suggest alternatives and wiring\n\nWhat are you building today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setStreaming(true);
    setStreamingText("");

    try {
      const allMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Try streaming first
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/chat/stream`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages,
            project_context: projectContext,
            stream: true,
          }),
        }
      );

      if (!response.ok) throw new Error("Stream failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullText += parsed.content;
                  setStreamingText(fullText);
                }
              } catch {}
            }
          }
        }
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fullText || "I could not generate a response. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingText("");
    } catch {
      // Fallback to non-streaming
      try {
        const allMessages = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const { data } = await api.post("/api/chat/", {
          messages: allMessages,
          project_context: projectContext,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.message,
            timestamp: new Date(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Sorry, I am having trouble connecting. Please check that the backend is running.",
            timestamp: new Date(),
          },
        ]);
      }
      setStreamingText("");
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "Chat cleared. How can I help you?",
      timestamp: new Date(),
    }]);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
          title="Open AI Assistant"
        >
          <Sparkles className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-950 animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className={`fixed right-6 z-50 flex flex-col bg-gray-950 border border-gray-700 rounded-2xl shadow-2xl transition-all ${
            minimized ? "bottom-6 w-72 h-14" : "bottom-6 w-96 h-[600px]"
          }`}
          style={{ maxHeight: "calc(100vh - 100px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">COTsify AI</p>
                <p className="text-cyan-200 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearChat} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Clear chat">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setMinimized(!minimized)} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-cyan-600" : "bg-gray-700"}`}>
                      {msg.role === "user" ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${msg.role === "user" ? "bg-cyan-600 text-white rounded-tr-sm" : "bg-gray-800 text-gray-200 rounded-tl-sm"}`}>
                      <div className="flex flex-col gap-0.5">
                        {formatMessage(msg.content)}
                      </div>
                      <p className="text-xs opacity-50 mt-1 text-right">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Streaming message */}
                {streaming && streamingText && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="max-w-[80%] bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2 text-sm">
                      <div className="flex flex-col gap-0.5">
                        {formatMessage(streamingText)}
                      </div>
                      <span className="inline-block w-1.5 h-4 bg-cyan-400 animate-pulse ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Loading dots */}
                {loading && !streamingText && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
                  {SUGGESTIONS.slice(0, 3).map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex-shrink-0"
                    >
                      {s.length > 35 ? s.slice(0, 35) + "..." : s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-gray-800 flex-shrink-0">
                <div className="flex gap-2 items-end bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 focus-within:border-cyan-600 transition-colors">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about components, prices, wiring..."
                    rows={1}
                    className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 resize-none focus:outline-none max-h-24"
                    style={{ lineHeight: "1.5" }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {loading ? <Loader2 className="w-4 h-4 text-gray-950 animate-spin" /> : <Send className="w-4 h-4 text-gray-950" />}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1.5 text-center">
                  Press Enter to send · Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
