import type { Category, CurationStatus } from "./constants";

export interface AnalysisScores {
  placeDisappearance: number;
  lifeTechniqueRarity: number;
  generationalMemory: number;
  locality: number;
  personalArchiveQuality: number;
  lowCommercialization: number;
  mourningOrFarewellTone: number;
}

export interface AnalysisResult {
  category: Category | string;
  vanishingLifeScore: number;
  scores: AnalysisScores;
  observe: string;
  sample: string;
  recombine: string;
  question: string;
  fieldNoteTitle: string;
  fieldNote: string;
  tags: string[];
  articleAngle?: string | null;
  articleTitleCandidates?: string[] | null;
}

export interface YouTubeSearchResult {
  videoId: string;
  url: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
  comments: string[];
  rawJson: Record<string, unknown>;
}

export interface SerializedAnalysis {
  id: number;
  category: string;
  vanishingLifeScore: number;
  scores: AnalysisScores;
  observe: string;
  sample: string;
  recombine: string;
  question: string;
  fieldNoteTitle: string;
  fieldNote: string;
  tags: string[];
  articleAngle?: string | null;
  articleTitleCandidates?: string[];
  model: string;
  publishStatus: string;
  createdAt: string;
}

export interface SerializedVideo {
  id: number;
  videoId: string;
  url: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  seedKeyword: string;
  curationStatus: CurationStatus;
  humanNote: string | null;
  publicNote: string | null;
  publishStatus: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  status: "analyzed" | "unanalyzed";
  tags: string[];
  comments: string[];
  analysis?: SerializedAnalysis;
}
