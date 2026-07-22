"use client";

import React from "react";
import { Star, ShieldAlert, BookOpen, Trash2, ShieldCheck, Activity } from "lucide-react";

export interface IHistoryItem {
  _id: string;
  owner: string;
  repo: string;
  projectTitle: string;
  updatedAt: string;
}

interface SidebarInfoProps {
  owner: string;
  repo: string;
  techStack: string[];
  history: IHistoryItem[];
  onSelectHistory: (item: IHistoryItem) => void;
  onDeleteHistory: (id: string, e: React.MouseEvent) => void;
  securityCount: number;
}

export default function SidebarInfo({
  owner,
  repo,
  techStack,
  history,
  onSelectHistory,
  onDeleteHistory,
  securityCount,
}: SidebarInfoProps) {
  // Calculate health score: start at 100%, deduct points for high severity security issues
  const healthScore = Math.max(10, 100 - securityCount * 8);

  const getHealthText = (score: number) => {
    if (score >= 90) return "Optimal repository structural integrity.";
    if (score >= 70) return "Moderate risks detected. Patches recommended.";
    return "High vulnerability threat levels detected!";
  };

  const timeAgo = (dateStr: string) => {
    try {
      const parsed = new Date(dateStr);
      const diffMs = Date.now() - parsed.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return parsed.toLocaleDateString();
    } catch {
      return "";
    }
  };

  return (
    <aside className="w-[320px] border-r border-outline-variant flex flex-col surface-base overflow-y-auto custom-scrollbar shrink-0">
      <div className="p-6 flex flex-col gap-6 h-full justify-between">
        <div className="space-y-6">
          {/* Repository Info Card */}
          <section>
            <h2 className="text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest text-[11px] font-bold">
              Repository Info
            </h2>
            <div className="border-base p-4 rounded bg-[#09090B] flex flex-col gap-3">
              <div>
                <p className="text-headline-sm font-bold text-primary truncate">
                  {owner}/{repo}
                </p>
                <p className="text-body-md text-on-surface-variant mt-1 leading-snug">
                  Public codebase analyzed via RepoMap engine.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-3 border-t border-outline-variant/30 text-xs font-mono text-[#A1A1AA]">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Active</span>
                </div>
              </div>
            </div>
          </section>

          {/* Tech Stack Badges */}
          <section>
            <h2 className="text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest text-[11px] font-bold">
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {techStack.length === 0 ? (
                <span className="text-body-md text-on-surface-variant italic">No tech stack parsed.</span>
              ) : (
                techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 border-base bg-[#18181B] text-code-md font-code-md text-[#A1A1AA] hover:text-white transition-colors cursor-default rounded-sm"
                  >
                    {tech}
                  </span>
                ))
              )}
            </div>
          </section>

          {/* Analysis History */}
          <section className="flex flex-col">
            <h2 className="text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest text-[11px] font-bold">
              Recent Analyses
            </h2>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-xs text-on-surface-variant/40 italic p-2">No past history found.</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => onSelectHistory(item)}
                    className="group flex items-center justify-between p-2 rounded hover:bg-surface-container-highest cursor-pointer transition-all border border-transparent hover:border-outline-variant"
                  >
                    <div className="overflow-hidden mr-2">
                      <p className="text-body-md text-primary font-medium truncate">
                        {item.owner}/{item.repo}
                      </p>
                      <p className="text-[10px] text-on-surface-variant font-mono">
                        {timeAgo(item.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => onDeleteHistory(item._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-error-container/20 rounded transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-error" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Health Score Panel (Stitch Bento element) */}
        <section className="pt-4 border-t border-outline-variant/30">
          <div className="p-4 bg-surface-container rounded-lg border border-outline-variant">
            <div className="flex justify-between items-center mb-1">
              <span className="font-label-sm text-secondary font-bold">
                Health Score: {healthScore}%
              </span>
              {healthScore >= 80 ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-error" />
              )}
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  healthScore >= 80 ? "bg-emerald-400" : healthScore >= 60 ? "bg-amber-400" : "bg-error"
                }`}
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>

            {/* Sparkline element */}
            <div className="h-10 flex items-end gap-1 mt-3">
              <div className="flex-1 bg-secondary/15 h-[50%] rounded-t-sm"></div>
              <div className="flex-1 bg-secondary/20 h-[65%] rounded-t-sm"></div>
              <div className="flex-1 bg-secondary/15 h-[55%] rounded-t-sm"></div>
              <div className="flex-1 bg-secondary/40 h-[80%] rounded-t-sm"></div>
              <div className="flex-1 bg-secondary/35 h-[70%] rounded-t-sm"></div>
              <div
                className={`flex-1 ${healthScore >= 80 ? "bg-emerald-400/80" : "bg-error/80"} h-full rounded-t-sm`}
              ></div>
            </div>

            <p className="text-[10px] text-on-surface-variant mt-2.5 italic leading-normal">
              {getHealthText(healthScore)}
            </p>
          </div>
        </section>
      </div>
    </aside>
  );
}
