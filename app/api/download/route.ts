import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RepoAnalysis from "@/models/RepoAnalysis";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const format = searchParams.get("format");

    if (!id || !format) {
      return new NextResponse("Missing id or format parameters", { status: 400 });
    }

    await dbConnect();
    const analysis = await RepoAnalysis.findById(id);
    if (!analysis) {
      return new NextResponse("Codebase analysis not found", { status: 404 });
    }

    let content = "";
    let mimeType = "";
    let fileExtension = "";

    const {
      owner,
      repo,
      projectTitle,
      laymanSummary,
      techStack,
      architectureSummary,
      folderBreakdown,
      setupSteps,
      securityAlerts,
    } = analysis;

    if (format === "json") {
      content = JSON.stringify(analysis, null, 2);
      mimeType = "application/json";
      fileExtension = "json";
    } else if (format === "md") {
      content = `# ${projectTitle} (${owner}/${repo})

## 💡 Layman Summary
${laymanSummary || "No layman summary generated."}

## 🌟 Tech Stack
${techStack.map((t) => `- ${t}`).join("\n")}

## 📐 Architecture Summary
${architectureSummary}

## 📂 Key Directory Layout
${folderBreakdown.map((f) => `### ${f.path}\n${f.purpose}`).join("\n\n")}

## 🛠️ Setup Guide
${setupSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

## 🛡️ Dependency Audit
| Package | Risk Level | Recommendation |
|---|---|---|
${securityAlerts.map((a) => `| ${a.package} | ${a.riskLevel.toUpperCase()} | ${a.recommendation} |`).join("\n")}
`;
      mimeType = "text/markdown; charset=utf-8";
      fileExtension = "md";
    } else if (format === "csv") {
      const csvLines = [
        `"RepoMap Analysis Report","${owner}/${repo}"`,
        `"Project Title","${projectTitle}"`,
        `"Layman Summary","${(laymanSummary || "").replace(/"/g, '""')}"`,
        "",
        `"Module Path","Responsibility"`,
        ...folderBreakdown.map((f) => `"${f.path}","${f.purpose.replace(/"/g, '""')}"`),
        "",
        `"Package","Risk Level","Recommendation"`,
        ...securityAlerts.map((a) => `"${a.package}","${a.riskLevel}","${a.recommendation.replace(/"/g, '""')}"`),
      ];
      content = csvLines.join("\n");
      mimeType = "text/csv; charset=utf-8";
      fileExtension = "csv";
    } else if (format === "html") {
      content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectTitle} - RepoMap Report</title>
  <style>
    body { background: #09090b; color: #e5e2e1; font-family: system-ui, -apple-system, sans-serif; padding: 2rem; max-width: 900px; margin: 0 auto; line-height: 1.6; }
    h1 { font-size: 2.5rem; border-bottom: 2px solid #27272a; padding-bottom: 1rem; color: #ffffff; }
    h2 { font-size: 1.5rem; color: #ffffff; margin-top: 2rem; border-bottom: 1px solid #27272a; padding-bottom: 0.5rem; }
    h3 { font-size: 1.1rem; color: #ffffff; margin-top: 1.5rem; }
    .badge { display: inline-block; background: #201f1f; border: 1px solid #444748; color: #ffffff; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; margin-right: 0.5rem; margin-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #444748; padding: 0.75rem; text-align: left; }
    th { background: #1c1b1b; color: #ffffff; }
    ul, ol { padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
    pre { background: #141313; border: 1px solid #444748; padding: 1rem; border-radius: 6px; overflow-x: auto; font-family: monospace; }
  </style>
</head>
<body>
  <h1>${projectTitle} Report</h1>
  <p style="color: #c4c7c8;">Analyzed repository: <strong>github.com/${owner}/${repo}</strong></p>
  
  <h2>Layman Summary</h2>
  <p>${laymanSummary || "No layman summary generated."}</p>
  
  <h2>Tech Stack</h2>
  <div style="margin-top: 1rem;">${techStack.map((t) => `<span class="badge">${t}</span>`).join("")}</div>
  
  <h2>Architecture Summary</h2>
  <p style="white-space: pre-line;">${architectureSummary}</p>
  
  <h2>Key Directory Layout</h2>
  <ul>
    ${folderBreakdown.map((f) => `<li><strong>${f.path}</strong>: ${f.purpose}</li>`).join("")}
  </ul>
  
  <h2>Setup Guide</h2>
  <ol>
    ${setupSteps.map((s) => `<li>${s}</li>`).join("")}
  </ol>
  
  <h2>Security Dependency Audit</h2>
  <table>
    <thead>
      <tr><th>Package</th><th>Risk Level</th><th>Recommendation</th></tr>
    </thead>
    <tbody>
      ${securityAlerts.map((a) => `<tr><td><strong>${a.package}</strong></td><td style="color: ${a.riskLevel === "high" ? "#ffb4ab" : a.riskLevel === "medium" ? "#e5e2e1" : "#c4c7c8"};">${a.riskLevel.toUpperCase()}</td><td>${a.recommendation}</td></tr>`).join("")}
    </tbody>
  </table>
</body>
</html>`;
      mimeType = "text/html; charset=utf-8";
      fileExtension = "html";
    }

    const filename = `repomap_${owner}_${repo}.${fileExtension}`;
    return new NextResponse(content, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Access-Control-Expose-Headers": "Content-Disposition",
      },
    });
  } catch (error: any) {
    return new NextResponse(error.message || "Failed to generate download file", { status: 500 });
  }
}
