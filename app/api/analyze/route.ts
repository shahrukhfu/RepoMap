import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RepoAnalysis from "@/models/RepoAnalysis";
import { parseGithubUrl, getDefaultBranch, fetchRepoTree, getHighValueFiles } from "@/lib/github";
import { synthesizeRepo } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, forceRefresh } = body;

    if (!url) {
      return NextResponse.json({ error: "GitHub URL is required" }, { status: 400 });
    }

    const parsed = parseGithubUrl(url);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 });
    }

    const { owner, repo } = parsed;

    // Connect to database
    await dbConnect();

    // Check for cached result within 24 hours (unless forceRefresh is true)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cachedAnalysis = forceRefresh
      ? null
      : await RepoAnalysis.findOne({
          owner: owner.toLowerCase(),
          repo: repo.toLowerCase(),
          updatedAt: { $gte: oneDayAgo },
        });

    if (cachedAnalysis) {
      console.log(`Using cached analysis for ${owner}/${repo}`);
      return NextResponse.json(cachedAnalysis);
    }

    // Token configuration
    const githubToken = process.env.GITHUB_TOKEN;

    // 1. Fetch default branch
    const branch = await getDefaultBranch(owner, repo, githubToken);

    // 2. Fetch repo tree
    const tree = await fetchRepoTree(owner, repo, branch, githubToken);
    if (tree.length === 0) {
      return NextResponse.json({ error: "Empty repository or failed to fetch file tree" }, { status: 400 });
    }

    // Filter out noise
    const noisePatterns = [
      "node_modules",
      ".git/",
      ".next/",
      "dist/",
      "out/",
      "build/",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "pnpm-workspace.yaml",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".webp",
      ".svg",
      ".ico",
    ];

    const filteredTree = tree.filter((file) => {
      const lowerPath = file.path.toLowerCase();
      return !noisePatterns.some((pattern) => lowerPath.includes(pattern));
    });

    // 3. Fetch high-value configuration contents
    const configFiles = await getHighValueFiles(owner, repo, filteredTree, githubToken);

    // 4. Synthesize via Gemini API
    const synthesis = await synthesizeRepo(owner, repo, filteredTree, configFiles);

    // 5. Cache result to MongoDB
    // Find and update or create new record
    const updatedAnalysis = await RepoAnalysis.findOneAndUpdate(
      { owner: owner.toLowerCase(), repo: repo.toLowerCase() },
      {
        owner: owner.toLowerCase(),
        repo: repo.toLowerCase(),
        projectTitle: synthesis.projectTitle,
        techStack: synthesis.techStack,
        laymanSummary: synthesis.laymanSummary,
        architectureSummary: synthesis.architectureSummary,
        folderBreakdown: synthesis.folderBreakdown,
        setupSteps: synthesis.setupSteps,
        securityAlerts: synthesis.securityAlerts,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(updatedAnalysis);
  } catch (error: any) {
    console.error("API Analyze handler failed:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during repository analysis" },
      { status: 500 }
    );
  }
}
