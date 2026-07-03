export interface PublicDashboardStats {
  videoCount: number;
  fieldNoteCount: number;
  unanalyzedPublicCount: number;
  meaningLayerCount: number;
  activeSeedCount: number;
  categoryCounts: Record<string, number>;
  recentFieldNotes: Array<{
    videoId: string;
    fieldNoteTitle: string;
    category: string;
    vanishingLifeScore: number;
  }>;
  topVideos: Array<{
    videoId: string;
    title: string;
    vanishingLifeScore: number;
    category: string;
  }>;
  articleCandidates: Array<{
    videoId: string;
    heading: string;
    subline: string | null;
    publicNoteExcerpt: string | null;
    sourceTitle: string;
    category: string;
    vanishingLifeScore: number;
  }>;
  meaningLayerCandidates: Array<{
    videoId: string;
    heading: string;
    subline: string | null;
    publicNoteExcerpt: string | null;
    sourceTitle: string;
    category: string;
    vanishingLifeScore: number;
  }>;
  clusters: Array<{
    id: number;
    title: string;
    question: string;
    itemCount: number;
    candidateCount: number;
    tags: string[];
  }>;
  seeds: Array<{ id: number; keyword: string }>;
}
