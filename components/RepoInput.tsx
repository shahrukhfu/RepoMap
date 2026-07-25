"use client";

import React, { useState, useEffect } from "react";
import { Link2, Search, ArrowUp } from "lucide-react";

interface RepoInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  initialUrl?: string;
  compact?: boolean;
}

export default function RepoInput({ onAnalyze, isLoading, initialUrl = "", compact = false }: RepoInputProps) {
  const [url, setUrl] = useState(initialUrl);
  const [logStep, setLogStep] = useState(0);

  const logs = [
    { text: "Parsing repository URL...", status: "done" },
    { text: "Connecting to MongoDB cache...", status: "done" },
    { text: "Querying GitHub repository tree...", status: "active" },
    { text: "Filtering package structures & manifests...", status: "pending" },
    { text: "Extracting package.json & README.md configuration...", status: "pending" },
    { text: "Sending payload to AI for synthesis...", status: "pending" },
    { text: "Building interactive database dashboards...", status: "pending" },
  ];

  // Simulating logging steps while isLoading is true
  useEffect(() => {
    if (!isLoading) {
      setLogStep(0);
      return;
    }

    const interval = setInterval(() => {
      setLogStep((prev) => {
        if (prev < logs.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  const handleExampleClick = (repoName: string) => {
    const fullUrl = `https://github.com/${repoName}`;
    setUrl(fullUrl);
    onAnalyze(fullUrl);
  };

  if (isLoading && !compact) {
    return (
      <div className="w-full max-w-[640px] z-10 mx-auto animate-fade-in">
        <div className="bg-surface-container-low border border-outline-variant shadow-2xl rounded-lg overflow-hidden flex flex-col h-[400px]">
          {/* Console Header Bar */}
          <div className="h-10 bg-surface-container-high border-b border-outline-variant flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 mr-2">
                <div className="w-3 h-3 rounded-full bg-error/40 border border-error/50"></div>
                <div className="w-3 h-3 rounded-full bg-on-tertiary-container/40 border border-on-tertiary-container/50"></div>
                <div className="w-3 h-3 rounded-full bg-secondary/40 border border-secondary/50"></div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                Repository Analysis
              </span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant/40">
              <span className="font-code-md text-label-sm">v2.4.1-stable</span>
            </div>
          </div>

          {/* Console Terminal Screen */}
          <div className="flex-grow p-6 font-code-md text-code-md leading-relaxed overflow-y-auto relative bg-[#09090B]">
            <div className="scanline"></div>
            <div className="space-y-3">
              {logs.map((log, index) => {
                let statusColor = "text-on-surface-variant/40";
                let icon = "radio_button_unchecked";
                let isPulse = false;

                if (index < logStep) {
                  statusColor = "text-secondary";
                  icon = "check_circle";
                } else if (index === logStep) {
                  statusColor = "text-primary";
                  icon = "progress_activity";
                  isPulse = true;
                }

                return (
                  <div key={index} className={`flex items-center gap-3 transition-all duration-300 ${statusColor}`}>
                    {isPulse ? (
                      <span className="material-symbols-outlined text-[16px] animate-spin-slow">
                        progress_activity
                      </span>
                    ) : (
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{ fontVariationSettings: index < logStep ? "'FILL' 1" : "" }}
                      >
                        {icon}
                      </span>
                    )}
                    <span className={index < logStep ? "opacity-80" : ""}>{log.text}</span>
                  </div>
                );
              })}
              <div className="pt-2 text-on-surface-variant/30 flex items-center gap-1.5">
                <span>$ npm run analyze --repo={url}</span>
                <span className="w-2 h-4 bg-secondary cursor-blink inline-block"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex border-base bg-[#09090B] rounded h-10 items-center overflow-hidden">
        <div className="px-3 text-on-surface-variant flex items-center">
          <span className="material-symbols-outlined text-sm">link</span>
        </div>
        <input
          type="text"
          className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-code-md font-code-md flex-1 text-on-surface placeholder:text-outline px-2 h-full"
          placeholder="https://github.com/facebook/react"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-primary text-background font-medium text-label-sm px-4 h-full hover:bg-opacity-90 transition-all active:scale-95 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? "Scanning..." : "Analyze Repo"}
        </button>
      </form>
    );
  }

  return (
    <div className="w-full max-w-3xl text-center flex flex-col items-center gap-6">
      {/* Badge / Micro-content */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-outline-variant bg-surface-container-low mb-2 animate-fade-in">
        <span className="material-symbols-outlined text-[14px] text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>
          psychology
        </span>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          AI-Powered Repository Mapping
        </span>
      </div>

      {/* Hero Title */}
      <div className="space-y-4">
        <h1 className="font-headline-lg text-[48px] leading-[1.1] tracking-tighter text-primary">
          Understand any codebase<br />
          <span className="text-on-surface-variant">in seconds.</span>
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
          RepoMap AI parses, maps, and analyzes your public repository structures to provide instant architectural insights and dependency checks.
        </p>
      </div>

      {/* Main Large Input Group */}
      <div className="w-full mt-4">
        <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row items-stretch gap-0 border border-outline-variant bg-surface-container-lowest focus-within:border-primary transition-all duration-300 rounded-lg overflow-hidden">
            <div className="flex items-center px-4 text-on-surface-variant">
              <span className="material-symbols-outlined">link</span>
            </div>
            <input
              type="text"
              className="flex-grow bg-transparent border-none outline-none focus:outline-none focus:ring-0 font-code-md text-code-md py-4 px-2 text-primary placeholder:text-outline"
              placeholder="https://github.com/facebook/react"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-primary text-background font-bold px-8 py-4 hover:bg-on-surface transition-colors font-body-md text-body-md whitespace-nowrap active:scale-[0.98] disabled:opacity-50"
              disabled={isLoading}
            >
              Analyze Repo
            </button>
          </div>
        </form>

        {/* Example Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 animate-fade-in-up">
          <span className="font-label-sm text-label-sm text-on-surface-variant mr-1">
            Try these examples:
          </span>
          <button
            onClick={() => handleExampleClick("vercel/next.js")}
            className="mono-badge flex items-center gap-2 px-3 py-1 bg-surface-container border border-outline-variant rounded hover:bg-surface-container-high hover:border-outline text-on-surface-variant font-code-md text-code-md"
          >
            <span className="material-symbols-outlined text-[14px]">terminal</span>
            vercel/next.js
          </button>
          <button
            onClick={() => handleExampleClick("facebook/react")}
            className="mono-badge flex items-center gap-2 px-3 py-1 bg-surface-container border border-outline-variant rounded hover:bg-surface-container-high hover:border-outline text-on-surface-variant font-code-md text-code-md"
          >
            <span className="material-symbols-outlined text-[14px]">history</span>
            facebook/react
          </button>
          <button
            onClick={() => handleExampleClick("tailwindlabs/tailwindcss")}
            className="mono-badge flex items-center gap-2 px-3 py-1 bg-surface-container border border-outline-variant rounded hover:bg-surface-container-high hover:border-outline text-on-surface-variant font-code-md text-code-md"
          >
            <span className="material-symbols-outlined text-[14px]">folder</span>
            tailwindlabs/tailwindcss
          </button>
        </div>
      </div>
    </div>
  );
}
