import type { YouTubeSearchResult } from "./types";

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return iso;
  const h = match[1] ? `${match[1]}:` : "";
  const m = (match[2] ?? "0").padStart(h ? 2 : 1, "0");
  const s = (match[3] ?? "0").padStart(2, "0");
  return h ? `${h}${m}:${s}` : `${m}:${s}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API error: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

interface SearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails?: { medium?: { url: string }; default?: { url: string } };
  };
}

interface VideoItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
    thumbnails?: { medium?: { url: string } };
  };
  contentDetails: { duration: string };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

interface CommentItem {
  snippet: {
    topLevelComment: {
      snippet: { textDisplay: string };
    };
  };
}

export function hasYouTubeApiKey(): boolean {
  return Boolean(process.env.YOUTUBE_API_KEY?.trim());
}

export async function searchYouTubeVideos(
  keyword: string,
  maxResults = 10
): Promise<YouTubeSearchResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is not configured");
  }

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", keyword);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("maxResults", String(maxResults));
  searchUrl.searchParams.set("key", apiKey);

  const searchData = await fetchJson<{ items?: SearchItem[] }>(
    searchUrl.toString()
  );
  const items = searchData.items ?? [];
  if (items.length === 0) return [];

  const videoIds = items.map((item) => item.id.videoId).join(",");
  const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  videosUrl.searchParams.set("part", "snippet,contentDetails,statistics");
  videosUrl.searchParams.set("id", videoIds);
  videosUrl.searchParams.set("key", apiKey);

  const videosData = await fetchJson<{ items?: VideoItem[] }>(
    videosUrl.toString()
  );
  const videoMap = new Map(
    (videosData.items ?? []).map((v) => [v.id, v] as const)
  );

  const results: YouTubeSearchResult[] = [];

  for (const item of items) {
    const videoId = item.id.videoId;
    const detail = videoMap.get(videoId);
    const snippet = detail?.snippet ?? item.snippet;

    let comments: string[] = [];
    try {
      const commentsUrl = new URL(
        "https://www.googleapis.com/youtube/v3/commentThreads"
      );
      commentsUrl.searchParams.set("part", "snippet");
      commentsUrl.searchParams.set("videoId", videoId);
      commentsUrl.searchParams.set("maxResults", "5");
      commentsUrl.searchParams.set("textFormat", "plainText");
      commentsUrl.searchParams.set("key", apiKey);

      const commentsData = await fetchJson<{ items?: CommentItem[] }>(
        commentsUrl.toString()
      );
      comments = (commentsData.items ?? [])
        .map((c) => c.snippet.topLevelComment.snippet.textDisplay)
        .filter(Boolean);
    } catch {
      comments = [];
    }

    results.push({
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title: snippet.title,
      description: snippet.description ?? "",
      channelTitle: snippet.channelTitle,
      publishedAt: snippet.publishedAt,
      thumbnailUrl:
        snippet.thumbnails?.medium?.url ??
        item.snippet.thumbnails?.medium?.url ??
        item.snippet.thumbnails?.default?.url ??
        "",
      duration: parseDuration(detail?.contentDetails.duration ?? "PT0S"),
      viewCount: Number(detail?.statistics.viewCount ?? 0),
      likeCount: Number(detail?.statistics.likeCount ?? 0),
      commentCount: Number(detail?.statistics.commentCount ?? 0),
      tags: detail?.snippet.tags ?? [],
      comments,
      rawJson: { search: item, detail },
    });
  }

  return results;
}
