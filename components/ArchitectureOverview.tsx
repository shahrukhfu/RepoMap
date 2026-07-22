"use client";

import React from "react";

export interface IFolder {
  path: string;
  purpose: string;
}

interface ArchitectureOverviewProps {
  summary: string;
  folders: IFolder[];
}

export default function ArchitectureOverview({ summary, folders }: ArchitectureOverviewProps) {
  // Simple helper to calculate file path complexity mock bar width and text representation
  const getComplexity = (path: string) => {
    const depth = path.split("/").length;
    if (depth >= 3) return { width: "85%", label: "HIGH", color: "bg-error" };
    if (depth === 2) return { width: "60%", label: "MODERATE", color: "bg-secondary" };
    return { width: "35%", label: "LOW", color: "bg-on-primary-container" };
  };

  return (
    <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Architecture Summary */}
        <section className="border-base bg-[#18181B] rounded overflow-hidden">
          <div className="border-b border-outline-variant px-6 py-4 flex items-center justify-between bg-[#1C1C1F]">
            <h3 className="text-label-caps text-white font-semibold tracking-wider text-[11px]">
              Architecture Summary
            </h3>
            <span className="px-2 py-0.5 border-base text-[10px] font-code-md text-on-surface-variant rounded">
              GEMINI SYNTHESIS
            </span>
          </div>
          <div className="p-6 font-mono text-code-md leading-relaxed text-[#A1A1AA] whitespace-pre-line">
            {summary}
          </div>
        </section>

        {/* Directory Breakdown Table */}
        <section className="border-base bg-[#18181B] rounded overflow-hidden">
          <div className="border-b border-outline-variant px-6 py-4 bg-[#1C1C1F]">
            <h3 className="text-label-caps text-white font-semibold tracking-wider text-[11px]">
              Key Directory Mapping
            </h3>
          </div>
          {folders.length === 0 ? (
            <div className="p-6 text-center text-on-surface-variant font-mono">
              No folder breakdown mapped for this codebase.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono">
                <thead>
                  <tr className="border-b border-outline-variant bg-[#09090B]/50 text-[#c4c7c8]">
                    <th className="px-6 py-3 text-label-sm font-semibold uppercase tracking-wider text-[11px]">
                      Module Path
                    </th>
                    <th className="px-6 py-3 text-label-sm font-semibold uppercase tracking-wider text-[11px]">
                      Responsibility
                    </th>
                    <th className="px-6 py-3 text-label-sm font-semibold uppercase tracking-wider text-[11px]">
                      Structure Depth
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-code-md">
                  {folders.map((folder, index) => {
                    const comp = getComplexity(folder.path);
                    return (
                      <tr key={index} className="hover:bg-[#1C1C1F] transition-colors group">
                        <td className="px-6 py-4 text-white font-semibold">{folder.path}</td>
                        <td className="px-6 py-4 text-[#A1A1AA] font-sans">{folder.purpose}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-[#27272A] rounded-full overflow-hidden shrink-0">
                              <div
                                className={`h-full ${comp.color} rounded-full`}
                                style={{ width: comp.width }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-on-surface-variant font-bold">
                              {comp.label}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
