import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFolderBreakdown {
  path: string;
  purpose: string;
}

export interface ISecurityAlert {
  package: string;
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
}

export interface IRepoAnalysis extends Document {
  owner: string;
  repo: string;
  projectTitle: string;
  techStack: string[];
  architectureSummary: string;
  folderBreakdown: IFolderBreakdown[];
  setupSteps: string[];
  securityAlerts: ISecurityAlert[];
  createdAt: Date;
  updatedAt: Date;
}

const FolderBreakdownSchema = new Schema<IFolderBreakdown>({
  path: { type: String, required: true },
  purpose: { type: String, required: true },
});

const SecurityAlertSchema = new Schema<ISecurityAlert>({
  package: { type: String, required: true },
  riskLevel: { type: String, enum: ["low", "medium", "high"], required: true },
  recommendation: { type: String, required: true },
});

const RepoAnalysisSchema = new Schema<IRepoAnalysis>(
  {
    owner: { type: String, required: true, index: true },
    repo: { type: String, required: true, index: true },
    projectTitle: { type: String, required: true },
    techStack: { type: [String], required: true },
    architectureSummary: { type: String, required: true },
    folderBreakdown: { type: [FolderBreakdownSchema], required: true },
    setupSteps: { type: [String], required: true },
    securityAlerts: { type: [SecurityAlertSchema], required: true },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model multiple times in Next.js hot-reloading environment
const RepoAnalysis: Model<IRepoAnalysis> =
  mongoose.models.RepoAnalysis || mongoose.model<IRepoAnalysis>("RepoAnalysis", RepoAnalysisSchema);

export default RepoAnalysis;
