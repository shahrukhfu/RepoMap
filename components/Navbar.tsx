"use client";

import React from "react";
import RepoInput from "./RepoInput";
import { Github } from "lucide-react";


interface NavbarProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  currentUrl: string;
  showInput: boolean;
}

export default function Navbar({ onAnalyze, isLoading, currentUrl, showInput }: NavbarProps) {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center h-16 px-8 bg-surface border-b border-outline-variant">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
        <span className="material-symbols-outlined text-primary text-2xl">terminal</span>
        <h1 className="text-headline-md font-bold text-primary tracking-tight">RepoMap</h1>
      </div>

      {/* Embedded Repo Input (Only shown on dashboard state) */}
      {showInput && (
        <div className="flex-1 max-w-2xl px-8 hidden md:block">
          <RepoInput
            onAnalyze={onAnalyze}
            isLoading={isLoading}
            initialUrl={currentUrl}
            compact={true}
          />
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-label-sm text-on-surface-variant font-medium">GitHub Status</span>
        </div>

        {/* GitHub Repository Link */}
        <a
          href="https://github.com/shahrukhfu/RepoMap"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 border border-outline-variant bg-surface-container hover:bg-surface-container-highest hover:border-[#6366F1]/50 rounded-lg text-label-sm font-medium transition-all text-white cursor-pointer select-none"
          title="View GitHub Repository"
        >
          <Github className="w-4 h-4 text-secondary" />
          <span className="text-[12px] font-sans">GitHub</span>
        </a>
      </div>
    </header>
  );
}
