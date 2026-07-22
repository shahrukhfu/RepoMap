import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RepoAnalysis from "@/models/RepoAnalysis";
import { askRepoAssistant } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repoId, question, history } = body;

    if (!repoId || !question) {
      return NextResponse.json({ error: "repoId and question are required fields" }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Fetch repository analysis metadata
    const repoData = await RepoAnalysis.findById(repoId);
    if (!repoData) {
      return NextResponse.json({ error: "Repository analysis context not found" }, { status: 404 });
    }

    // Call Gemini chat helper
    const answer = await askRepoAssistant(
      {
        projectTitle: repoData.projectTitle,
        techStack: repoData.techStack,
        architectureSummary: repoData.architectureSummary,
        folderBreakdown: repoData.folderBreakdown,
        setupSteps: repoData.setupSteps,
      },
      question,
      history || []
    );

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("API Chat handler failed:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during chat processing" },
      { status: 500 }
    );
  }
}
