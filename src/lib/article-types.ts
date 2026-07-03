export interface ArticleOutlineItem {
  heading: string;
  summary: string;
}

export interface ArticleGenerationResult {
  title: string;
  subtitle: string;
  theme: string;
  angle: string;
  lead: string;
  outline: ArticleOutlineItem[];
  bodyDraft: string;
  questions: string[];
  tags: string[];
}

export interface SerializedArticleDraft {
  id: number;
  title: string;
  subtitle: string;
  theme: string;
  angle: string;
  lead: string;
  outline: ArticleOutlineItem[];
  selectedVideoIds: number[];
  bodyDraft: string;
  questions: string[];
  tags: string[];
  titleCandidates: TitleCandidate[];
  linkedinPost: string | null;
  noteIntro: string | null;
  status: string;
  publishStatus: string;
  createdAt: string;
  updatedAt: string;
  selectedVideos?: Array<{
    id: number;
    title: string;
    url: string;
    channelTitle: string;
  }>;
  revisions?: ArticleRevisionRecord[];
}

export interface TitleCandidate {
  type: string;
  title: string;
}

export interface ArticleRevisionRecord {
  id: number;
  articleDraftId: number;
  actionType: string;
  actionLabel: string;
  createdAt: string;
}

export interface ArticleCandidateVideo {
  id: number;
  videoId: string;
  url: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnailUrl: string;
  category: string;
  vanishingLifeScore: number;
  fieldNoteTitle: string;
  articleAngle: string | null;
  humanNotePreview: string | null;
}
