"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import RepoInput from "@/components/RepoInput";
import SidebarInfo, { IHistoryItem } from "@/components/SidebarInfo";
import ArchitectureOverview from "@/components/ArchitectureOverview";
import SetupGuide from "@/components/SetupGuide";
import DependencyAudit from "@/components/DependencyAudit";
import AiChatDrawer from "@/components/AiChatDrawer";
import { Download } from "lucide-react";
import Galaxy from "@/components/Galaxy";

interface IAnalysisResult {
  _id: string;
  owner: string;
  repo: string;
  projectTitle: string;
  techStack: string[];
  laymanSummary?: string;
  architectureSummary: string;
  folderBreakdown: { path: string; purpose: string }[];
  setupSteps: string[];
  securityAlerts: { package: string; riskLevel: "low" | "medium" | "high"; recommendation: string }[];
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [analysisData, setAnalysisData] = useState<IAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "setup" | "security">("overview");
  const [history, setHistory] = useState<IHistoryItem[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("repomap_history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history:", e);
      }
    }
  }, []);

  const handleAnalyze = async (targetUrl: string) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();

      if (res.ok && data._id) {
        setAnalysisData(data);
        setUrl(targetUrl);

        // Update history
        const newHistoryItem: IHistoryItem = {
          _id: data._id,
          owner: data.owner,
          repo: data.repo,
          projectTitle: data.projectTitle,
          updatedAt: new Date().toISOString(),
        };

        const updatedHistory = [
          newHistoryItem,
          ...history.filter((item) => item.owner !== data.owner || item.repo !== data.repo),
        ].slice(0, 10);

        setHistory(updatedHistory);
        localStorage.setItem("repomap_history", JSON.stringify(updatedHistory));
      } else {
        setErrorMsg(data.error || "Analysis failed. Please verify the URL and retry.");
      }
    } catch (err) {
      setErrorMsg("An unexpected connection error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: IHistoryItem) => {
    handleAnalyze(`https://github.com/${item.owner}/${item.repo}`);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter((item) => item._id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("repomap_history", JSON.stringify(updatedHistory));
  };

  const handleExportFormat = (format: "json" | "md" | "csv" | "html" | "pdf") => {
    if (!analysisData) return;

    if (format === "pdf") {
      setShowExportDropdown(false);
      window.print();
      return;
    }

    // Trigger standard browser download via real HTTP response headers
    window.location.href = `/api/download?id=${analysisData._id}&format=${format}`;
    setShowExportDropdown(false);
  };

  const handleRefresh = async () => {
    if (!analysisData) return;
    setIsRefreshing(true);
    try {
      const targetUrl = `https://github.com/${analysisData.owner}/${analysisData.repo}`;
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetUrl, forceRefresh: true }),
      });

      const data = await res.json();

      if (res.ok && data._id) {
        setAnalysisData(data);
      } else {
        alert(data.error || "Failed to refresh codebase analysis.");
      }
    } catch (err) {
      alert("An unexpected network error occurred while refreshing.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // State A: Active Loading Console Screen
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <Navbar onAnalyze={handleAnalyze} isLoading={isLoading} currentUrl={url} showInput={false} />
        <main className="flex-1 flex items-center justify-center relative p-8">
          <div className="fixed inset-0 pointer-events-none z-[-1] opacity-40">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
          </div>
          <RepoInput onAnalyze={handleAnalyze} isLoading={isLoading} initialUrl={url} compact={false} />
        </main>
      </div>
    );
  }

  // State B: Dashboard View with Data Loaded
  if (analysisData) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <Navbar onAnalyze={handleAnalyze} isLoading={isLoading} currentUrl={url} showInput={true} />

        <div className="flex flex-1 pt-16 overflow-hidden">
          {/* Left Sidebar */}
          <SidebarInfo
            owner={analysisData.owner}
            repo={analysisData.repo}
            techStack={analysisData.techStack}
            history={history}
            onSelectHistory={handleSelectHistory}
            onDeleteHistory={handleDeleteHistory}
            securityCount={analysisData.securityAlerts.length}
          />

          {/* Right main area */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
            {/* Tab Navigation header */}
            <nav className="flex items-center px-8 border-b border-outline-variant h-14 bg-background shrink-0">
              <div className="flex gap-8 h-full">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`text-label-sm font-medium h-full flex items-center transition-colors px-1 cursor-pointer ${
                    activeTab === "overview"
                      ? "text-white border-b-2 border-secondary"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("setup")}
                  className={`text-label-sm font-medium h-full flex items-center transition-colors px-1 cursor-pointer ${
                    activeTab === "setup"
                      ? "text-white border-b-2 border-secondary"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  Setup Commands
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`text-label-sm font-medium h-full flex items-center transition-colors px-1 cursor-pointer ${
                    activeTab === "security"
                      ? "text-white border-b-2 border-secondary"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  Security
                </button>
              </div>

              {/* Action buttons */}
              <div className="ml-auto flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-3 py-1.5 border border-outline-variant hover:bg-surface-container-highest rounded text-label-sm font-medium transition-all text-white bg-surface-container cursor-pointer disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? "animate-spin" : ""}`}>
                    refresh
                  </span>
                  <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-outline-variant hover:bg-surface-container-highest rounded text-label-sm font-medium transition-all text-white bg-surface-container cursor-pointer select-none"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Report</span>
                  </button>
                  {showExportDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-surface-container border border-outline-variant rounded-lg shadow-xl z-[100] flex flex-col py-1 overflow-hidden">
                      <button
                        onClick={() => handleExportFormat("json")}
                        className="px-4 py-2 hover:bg-surface-container-highest text-left text-[12px] text-on-surface-variant hover:text-white transition-colors flex items-center gap-2 cursor-pointer w-full bg-transparent border-none"
                      >
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">code</span>
                        <span>JSON (.json)</span>
                      </button>
                      <button
                        onClick={() => handleExportFormat("md")}
                        className="px-4 py-2 hover:bg-surface-container-highest text-left text-[12px] text-on-surface-variant hover:text-white transition-colors flex items-center gap-2 cursor-pointer w-full bg-transparent border-none"
                      >
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">article</span>
                        <span>Markdown (.md)</span>
                      </button>
                      <button
                        onClick={() => handleExportFormat("html")}
                        className="px-4 py-2 hover:bg-surface-container-highest text-left text-[12px] text-on-surface-variant hover:text-white transition-colors flex items-center gap-2 cursor-pointer w-full bg-transparent border-none"
                      >
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">html</span>
                        <span>HTML (.html)</span>
                      </button>
                      <button
                        onClick={() => handleExportFormat("csv")}
                        className="px-4 py-2 hover:bg-surface-container-highest text-left text-[12px] text-on-surface-variant hover:text-white transition-colors flex items-center gap-2 cursor-pointer w-full bg-transparent border-none"
                      >
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">table_chart</span>
                        <span>Spreadsheet (.csv)</span>
                      </button>
                      <button
                        onClick={() => handleExportFormat("pdf")}
                        className="px-4 py-2 hover:bg-surface-container-highest text-left text-[12px] text-on-surface-variant hover:text-white transition-colors flex items-center gap-2 cursor-pointer w-full bg-transparent border-none"
                      >
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">picture_as_pdf</span>
                        <span>PDF Document (.pdf)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </nav>

            {/* Tab panel canvas */}
            <div className="flex-1 flex flex-col overflow-hidden pb-24">
              {activeTab === "overview" && (
                <ArchitectureOverview
                  summary={analysisData.architectureSummary}
                  folders={analysisData.folderBreakdown}
                  laymanSummary={analysisData.laymanSummary}
                />
              )}
              {activeTab === "setup" && <SetupGuide steps={analysisData.setupSteps} />}
              {activeTab === "security" && (
                <DependencyAudit alerts={analysisData.securityAlerts} techStack={analysisData.techStack} />
              )}
            </div>

            {/* AI Assistant Chat Drawer */}
            <AiChatDrawer repoId={analysisData._id} repoTitle={`${analysisData.owner}/${analysisData.repo}`} />
          </main>
        </div>
      </div>
    );
  }

  // State C: Landing Screen (No Repo Analyzed yet)
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Navbar onAnalyze={handleAnalyze} isLoading={isLoading} currentUrl={url} showInput={false} />

      {/* Galaxy Background Animation */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background">
        <div className="w-full h-full relative">
          <Galaxy
            starSpeed={0.5}
            density={1}
            hueShift={140}
            speed={1}
            glowIntensity={0.3}
            saturation={0}
            mouseRepulsion={false}
            repulsionStrength={2}
            twinkleIntensity={0.3}
            rotationSpeed={0.1}
            transparent={false}
          />
        </div>
      </div>

      {/* Background Decoration Shaders */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-[5]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4">
        <RepoInput onAnalyze={handleAnalyze} isLoading={isLoading} initialUrl={url} compact={false} />

        {/* Error notification */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded border border-error/20 bg-error/10 text-error font-sans text-sm max-w-md text-center">
            {errorMsg}
          </div>
        )}
      </main>
    </div>
  );
}
