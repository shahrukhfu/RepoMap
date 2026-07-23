import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Please define the GEMINI_API_KEY environment variable inside .env.local");
}

const ai = new GoogleGenAI({ apiKey });

export interface IRepoSynthesis {
  projectTitle: string;
  techStack: string[];
  laymanSummary: string;
  architectureSummary: string;
  folderBreakdown: { path: string; purpose: string }[];
  setupSteps: string[];
  securityAlerts: { package: string; riskLevel: "low" | "medium" | "high"; recommendation: string }[];
}

export async function synthesizeRepo(
  owner: string,
  repo: string,
  tree: { path: string; type: string }[],
  configFiles: Record<string, string>
): Promise<IRepoSynthesis> {
  const treeSnippet = tree
    .slice(0, 150) // Limit tree size in context
    .map((t) => `${t.type === "tree" ? "Dir: " : "File: "}${t.path}`)
    .join("\n");

  const configFilesSnippet = Object.entries(configFiles)
    .map(([path, content]) => `--- File: ${path} ---\n${content.slice(0, 2000)}`) // Limit content per file
    .join("\n\n");

  const prompt = `
Analyzing GitHub repository: ${owner}/${repo}

RECURSIVE FILE TREE (truncated to top 150 files):
${treeSnippet}

CONFIGURATION FILES & MANIFESTS:
${configFilesSnippet}

Analyze the provided repository tree and configuration files. Output ONLY a valid JSON object matching this schema:
{
  "projectTitle": "string",
  "techStack": ["string"],
  "laymanSummary": "A summary of what this project does and what problem it solves, written in very simple and easy-to-understand words for a layperson or client. You may use basic, easy-to-digest technical terms (e.g. database, server, client, user interface) where necessary, but keep it high-level, clear, and engaging.",
  "architectureSummary": "string",
  "folderBreakdown": [{ "path": "string", "purpose": "string" }],
  "setupSteps": ["string"],
  "securityAlerts": [{ "package": "string", "riskLevel": "low" | "medium" | "high", "recommendation": "string" }]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an expert software architect. Analyze codebases and extract setup guides, technology stacks, file layouts, a layman summary of what the codebase does, and potential dependency risks. You must output valid JSON matching the schema strictly.",
      },
    });

    const responseText = response.text?.trim() || "{}";
    const data = JSON.parse(responseText);

    // Provide robust defaults in case of empty fields
    return {
      projectTitle: data.projectTitle || `${owner}/${repo}`,
      techStack: Array.isArray(data.techStack) ? data.techStack : [],
      laymanSummary: data.laymanSummary || "No layman summary generated.",
      architectureSummary: data.architectureSummary || "No architecture summary generated.",
      folderBreakdown: Array.isArray(data.folderBreakdown) ? data.folderBreakdown : [],
      setupSteps: Array.isArray(data.setupSteps) ? data.setupSteps : [],
      securityAlerts: Array.isArray(data.securityAlerts) ? data.securityAlerts : [],
    };
  } catch (error) {
    console.error("Gemini repository synthesis failed:", error);
    throw new Error("Failed to synthesize repository analysis using Gemini API.");
  }
}

export async function askRepoAssistant(
  repoContext: {
    projectTitle: string;
    techStack: string[];
    architectureSummary: string;
    folderBreakdown: { path: string; purpose: string }[];
    setupSteps: string[];
  },
  question: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[]
): Promise<string> {
  const contextText = `
You are the interactive AI QA Assistant for the RepoMap repository analysis dashboard.
You are helping a developer understand this codebase:

Project Title: ${repoContext.projectTitle}
Tech Stack: ${repoContext.techStack.join(", ")}
Architecture Summary: ${repoContext.architectureSummary}

Folder Breakdown:
${repoContext.folderBreakdown.map((f) => `- ${f.path}: ${f.purpose}`).join("\n")}

Setup Guide:
${repoContext.setupSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}
`;

  try {
    // Formulate a chat thread using Gemini API
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history.length > 0 ? history : [],
      config: {
        systemInstruction: `${contextText}\nAnswer developer questions about the repository structures, file paths, logic setup, and configuration layout clearly. Use concise Markdown format, code blocks where appropriate, and cite specific folders or files.`,
      },
    });

    const response = await chat.sendMessage({
      message: question,
    });

    return response.text || "I was unable to formulate an answer.";
  } catch (error) {
    console.error("Gemini repo assistant chat failed:", error);
    return "The AI assistant encountered an error while processing your request. Please try again.";
  }
}
