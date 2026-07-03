import type { Cluster, ClusterItem } from "@/generated/prisma/client";

export interface SerializedClusterItem {
  id: number;
  clusterId: number;
  videoId: number;
  note: string | null;
  createdAt: string;
  video?: SerializedClusterVideo;
}

export interface SerializedClusterVideo {
  id: number;
  sourceTitle: string;
  thumbnailUrl: string;
  seedKeyword: string;
  fieldNoteTitle: string | null;
  articleAngle: string | null;
  category: string;
  vanishingLifeScore: number;
  humanNote: string | null;
  humanNoteExcerpt: string | null;
  tags: string[];
  curationStatus: string;
}

export interface SerializedCluster {
  id: number;
  title: string;
  description: string;
  theme: string;
  question: string;
  tags: string[];
  summary: string | null;
  hypothesis: string | null;
  articleAngles: string[];
  generatedQuestions: string[];
  recommendedTitle: string | null;
  publishStatus: string;
  itemCount: number;
  candidateCount: number;
  createdAt: string;
  updatedAt: string;
  items?: SerializedClusterItem[];
}

export interface ClusterSummaryResult {
  summary: string;
  hypothesis: string;
  articleAngles: string[];
  questions: string[];
  recommendedTitle: string;
}

export type ClusterWithItems = Cluster & {
  items: (ClusterItem & {
    video: {
      id: number;
      title: string;
      thumbnailUrl: string;
      seedKeyword: string;
      humanNote: string | null;
      curationStatus: string;
      analysis: {
        fieldNoteTitle: string;
        fieldNote: string;
        articleAngle: string | null;
        category: string;
        vanishingLifeScore: number;
        tagsJson: string;
      } | null;
    };
  })[];
  _count?: { items: number };
};

export type ClusterVideoSource = ClusterWithItems["items"][0]["video"];
