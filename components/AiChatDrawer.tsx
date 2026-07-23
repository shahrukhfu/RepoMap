"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Minimize2, Maximize2, Sparkles, X, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AiChatDrawerProps {
  repoId: string;
  repoTitle: string;
}

export default function AiChatDrawer({ repoId, repoTitle }: AiChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: `Hello! I have completed analyzing **${repoTitle}**. Ask me anything about the folder structures, dependencies, build configurations, or architectural design patterns of this repository!`,
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Where is the application entry point?",
    "Explain the folder organization layout",
    "What are the main technology dependencies used?",
    "Summarize local project startup steps",
  ];

  // Auto-scroll to the bottom of the chat logs
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isMinimized]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMessage: Message = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsSending(true);

    try {
      // Format history into Gemini API specs
      const historyPayload = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoId,
          question: textToSend,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      if (res.ok && data.answer) {
        setMessages((prev) => [...prev, { role: "model", text: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: `Error: ${data.error || "Failed to retrieve AI answer."}` },
        ],);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Error: Connection lost. Failed to send chat message." },
      ],);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(question);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-8 z-40 bg-white text-black font-semibold rounded-full px-5 py-3 flex items-center gap-2 shadow-2xl hover:bg-opacity-90 active:scale-95 transition-all pointer-events-auto"
      >
        <span className="material-symbols-outlined text-[18px]">psychology</span>
        <span>Ask Repo Assistant</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none z-40">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="glass-panel rounded-xl shadow-2xl border-white/10 overflow-hidden backdrop-blur-md transition-all duration-300">
          {/* Header Bar */}
          <div className="px-6 py-3 bg-surface-container border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">psychology</span>
              <span className="font-label-sm text-primary font-bold">Repo Assistant ({repoTitle})</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-on-surface-variant hover:text-primary outline-none"
                title={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-on-surface-variant hover:text-primary outline-none"
                title="Close chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Collapsible Area */}
          {!isMinimized && (
            <div className="flex flex-col bg-surface-container-lowest">
              {/* Chat Thread */}
              <div className="h-[240px] overflow-y-auto p-4 space-y-4 custom-scrollbar text-sm">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 max-w-[85%] ${
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                        msg.role === "user"
                          ? "bg-primary-container text-on-primary-container border-outline-variant"
                          : "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <span className="material-symbols-outlined text-xs">person</span>
                      ) : (
                        <span className="material-symbols-outlined text-xs">psychology</span>
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-lg leading-relaxed ${
                        msg.role === "user"
                          ? "bg-surface-container text-white"
                          : "bg-surface-container-low text-on-surface-variant border border-outline-variant/30"
                      }`}
                    >
                      {msg.role === "model" ? (
                        <div className="prose prose-invert max-w-none prose-sm font-sans space-y-1">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="font-sans whitespace-pre-wrap">{msg.text}</p>
                      )}
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex gap-3 mr-auto max-w-[85%] animate-pulse">
                    <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xs">psychology</span>
                    </div>
                    <div className="p-3 bg-surface-container-low text-on-surface-variant/40 border border-outline-variant/30 rounded-lg font-sans">
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions chips */}
              <div className="px-4 py-2 border-t border-outline-variant/30 flex gap-2 overflow-x-auto select-none bg-surface-container/50">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    className="shrink-0 px-3 py-1 rounded-full border border-outline-variant bg-[#09090B] text-[11px] text-on-surface-variant hover:border-primary hover:text-white transition-all cursor-pointer font-sans"
                    disabled={isSending}
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Bottom Input Area */}
              <form onSubmit={handleFormSubmit} className="p-4 border-t border-outline-variant bg-[#09090b]">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant flex items-center">
                    <Sparkles className="w-4 h-4 text-on-surface-variant animate-pulse-slow" />
                  </div>
                  <input
                    type="text"
                    className="w-full bg-[#09090B] border border-outline-variant rounded h-12 pl-12 pr-12 focus:ring-1 focus:ring-white focus:border-white outline-none text-body-md placeholder:text-on-surface-variant/50 text-white font-sans"
                    placeholder="Ask RepoMap about this codebase..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={isSending}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <button
                      type="submit"
                      className="p-1.5 bg-white text-black rounded hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                      disabled={isSending || !question.trim()}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
