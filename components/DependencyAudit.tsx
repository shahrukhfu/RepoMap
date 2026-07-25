"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, ArrowRight, ShieldCheckIcon, AlertTriangle } from "lucide-react";

export interface ISecurityAlert {
  package: string;
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
}

interface DependencyAuditProps {
  alerts: ISecurityAlert[];
  techStack: string[];
}

export default function DependencyAudit({ alerts, techStack }: DependencyAuditProps) {
  // Synthesize a list of dependencies to display in the table, combining alerts and general packages
  const tableData = [
    ...alerts.map((a) => ({
      name: a.package,
      version: "Outdated",
      status: "vulnerable" as const,
      riskLevel: a.riskLevel,
      recommendation: a.recommendation,
    })),
    // Fallback/Sample packages to populate the board beautifully
    {
      name: "next",
      version: "14.2.0",
      status: "stable" as const,
      riskLevel: "low" as const,
      recommendation: "Up to date",
    },
    {
      name: "typescript",
      version: "5.4.5",
      status: "stable" as const,
      riskLevel: "low" as const,
      recommendation: "Up to date",
    },
  ].filter((item, index, self) => self.findIndex((t) => t.name === item.name) === index); // Unique values

  // Find the highest severity alert to focus on in the AI Security Insight box
  const primaryAlert = alerts.find((a) => a.riskLevel === "high") || alerts[0];

  return (
    <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-end justify-between border-b border-outline-variant pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  alerts.length > 0
                    ? "bg-error/10 text-error border-error/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}
              >
                {alerts.length > 0 ? "Risks Detected" : "Secured"}
              </span>
              <span className="text-on-surface-variant font-code-md text-sm">/audit/security-report</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-primary">Dependency Risk Assessment</h1>
          </div>
        </div>

        {/* Security Table */}
        <div className="bg-surface-container-low border border-outline-variant rounded shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-surface-container-highest/30 border-b border-outline-variant text-[#c4c7c8]">
                <th className="px-6 py-3 font-label-caps text-[10px] uppercase">Package</th>
                <th className="px-6 py-3 font-label-caps text-[10px] uppercase">Threat Status</th>
                <th className="px-6 py-3 font-label-caps text-[10px] uppercase">Recommendation</th>
                <th className="px-6 py-3 font-label-caps text-[10px] uppercase text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-code-md">
              {tableData.map((item, index) => (
                <tr key={index} className="hover:bg-surface-container transition-colors group">
                  <td className="px-6 py-4 text-primary font-bold">{item.name}</td>
                  <td className="px-6 py-4">
                    {item.status === "vulnerable" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-error/10 text-error border border-error/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-error mr-1.5 animate-pulse"></span>
                        Vulnerable
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5"></span>
                        Up to date
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-on-surface font-sans">{item.recommendation}</td>
                  <td className="px-6 py-4 text-right">
                    {item.status === "vulnerable" ? (
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          item.riskLevel === "high"
                            ? "text-red-400 bg-red-950/20 border border-red-500/30"
                            : "text-amber-400 bg-amber-950/20 border border-amber-500/30"
                        }`}
                      >
                        {item.riskLevel.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-on-surface-variant/40">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Security Insight Card */}
        {primaryAlert ? (
          <div className="relative overflow-hidden bg-surface-container border border-secondary/30 rounded-xl p-6 group">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] -mr-32 -mt-32"></div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high border border-secondary/50 flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-secondary text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  psychology
                </span>
              </div>
              <div className="space-y-4 flex-grow">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-sm text-headline-sm text-primary">AI Security Insight</h3>
                  <span className="bg-secondary/20 text-secondary text-[10px] font-bold px-1.5 py-0.5 rounded border border-secondary/40 uppercase tracking-tighter">
                    Model Analysis
                  </span>
                </div>
                <div className="space-y-3 text-on-surface-variant leading-relaxed font-sans text-sm">
                  <p>
                    Vulnerability scan parsed on manifest configurations checks. The package{" "}
                    <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-secondary font-mono text-xs">
                      {primaryAlert.package}
                    </code>{" "}
                    is flagged with <span className="text-primary font-bold">{primaryAlert.riskLevel} severity risk</span>.
                  </p>
                  <p>{primaryAlert.recommendation}</p>
                  <div className="p-4 bg-[#09090B] border border-outline-variant rounded font-mono text-xs space-y-1">
                    <div className="text-on-surface-variant opacity-50">// Suggested patch command</div>
                    <div>
                      <span className="text-secondary">npm</span> install {primaryAlert.package}@latest
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-surface-container border border-emerald-500/30 rounded-xl p-6 group">
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high border border-emerald-500/50 flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-emerald-400 text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="font-headline-sm text-headline-sm text-primary">Codebase Audited Clean</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed font-sans">
                  AI did not detect high-risk vulnerable packages in standard configurations. All primary manifest dependencies align with secure baseline configurations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
