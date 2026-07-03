export interface PublicFieldNote {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  body: string;
  question: string;
  tags: string[];
  sourceVideoIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicArticle {
  slug: string;
  title: string;
  subtitle: string;
  lead: string;
  body: string;
  questions: string[];
  tags: string[];
  sourceVideoIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicCluster {
  slug: string;
  title: string;
  description: string;
  summary: string;
  question: string;
  articleAngles: string[];
  tags: string[];
  sourceVideoIds: string[];
}

export interface PublicVideo {
  id: string;
  slug: string;
  title: string;
  displayTitle: string;
  publicNote: string;
  channelTitle: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
  seedKeyword: string;
  category: string;
  vanishingLifeScore: number;
  tags: string[];
  curationRole: "field_note" | "meaning_layer" | "reference";
  fieldNoteSlug: string | null;
}

export interface PublicSourceVideo {
  id: string;
  title: string;
  channelTitle: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export interface PublicMeaningLayerFragment {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  observe: string;
  sample: string;
  recombine: string;
  question: string;
  articleAngle: string;
  tags: string[];
  sourceVideoIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicBundle {
  generatedAt: string;
  fieldNotes: PublicFieldNote[];
  meaningLayer: PublicMeaningLayerFragment[];
  articles: PublicArticle[];
  clusters: PublicCluster[];
  videos: PublicVideo[];
  sourceVideos: PublicSourceVideo[];
}

export interface ExportQueueItem {
  id: number;
  kind: "fieldNote" | "meaningLayer" | "article" | "cluster" | "video";
  title: string;
  publishStatus: string;
  updatedAt: string;
}
