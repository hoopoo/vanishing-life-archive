import { prisma } from "./prisma";
import { EXPORTABLE_PUBLISH_STATUSES } from "./constants";
import { isStaticPublicSite, loadPublicSiteData } from "./public-site-data";
import type {
  ExportQueueItem,
  PublicArticle,
  PublicBundle,
  PublicCluster,
  PublicFieldNote,
  PublicMeaningLayerFragment,
  PublicSourceVideo,
  PublicVideo,
} from "./publish-types";

function parseJsonArray<T>(json: string, fallback: T[] = []): T[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function slugify(text: string, id: number | string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return base ? `${base}-${id}` : `item-${id}`;
}

export function isExportablePublishStatus(status: string): boolean {
  return EXPORTABLE_PUBLISH_STATUSES.includes(
    status as (typeof EXPORTABLE_PUBLISH_STATUSES)[number]
  );
}

export async function buildPublicBundle(): Promise<PublicBundle> {
  if (isStaticPublicSite()) {
    return (await loadPublicSiteData()).bundle;
  }

  const exportable = [...EXPORTABLE_PUBLISH_STATUSES];

  const [analyses, articles, clusters] = await Promise.all([
    prisma.analysis.findMany({
      where: { publishStatus: { in: exportable } },
      include: { video: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.articleDraft.findMany({
      where: { publishStatus: { in: exportable } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.cluster.findMany({
      where: { publishStatus: { in: exportable } },
      include: {
        items: {
          include: { video: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const fieldNotes: PublicFieldNote[] = analyses
    .filter(
      (a) =>
        isExportablePublishStatus(a.video.publishStatus) &&
        a.video.curationStatus !== "meaning_layer_candidate"
    )
    .map((a) => ({
      slug: slugify(a.fieldNoteTitle, a.id),
      title: a.fieldNoteTitle,
      subtitle: a.video.publicNote?.trim() ?? "",
      category: a.category,
      body: a.fieldNote,
      question: a.question,
      tags: parseJsonArray<string>(a.tagsJson),
      sourceVideoIds: [a.video.videoId],
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));

  const meaningLayerVideos = await prisma.video.findMany({
    where: {
      curationStatus: "meaning_layer_candidate",
      publishStatus: { in: exportable },
    },
    include: { analysis: true },
    orderBy: { updatedAt: "desc" },
  });

  const meaningLayer: PublicMeaningLayerFragment[] = meaningLayerVideos
    .filter(
      (v) =>
        !v.analysis || isExportablePublishStatus(v.analysis.publishStatus)
    )
    .map((v) => {
      const a = v.analysis;
      const title =
        a?.fieldNoteTitle?.trim() || v.publicNote?.trim() || v.title;
      return {
        slug: slugify(title, `ml-${v.id}`),
        title,
        subtitle: v.publicNote?.trim() ?? "",
        category: a?.category ?? "—",
        observe: a?.observe ?? "",
        sample: a?.sample ?? "",
        recombine: a?.recombine ?? "",
        question: a?.question ?? "",
        articleAngle: a?.articleAngle?.trim() ?? "",
        tags: a ? parseJsonArray<string>(a.tagsJson) : [],
        sourceVideoIds: [v.videoId],
        createdAt: (a?.createdAt ?? v.createdAt).toISOString(),
        updatedAt: (a?.updatedAt ?? v.updatedAt).toISOString(),
      };
    });

  const publicArticles: PublicArticle[] = await Promise.all(
    articles.map(async (d) => {
      const dbIds = parseJsonArray<number>(d.selectedVideoIdsJson);
      const videos = dbIds.length
        ? await prisma.video.findMany({
            where: { id: { in: dbIds }, publishStatus: { in: exportable } },
            select: { videoId: true },
          })
        : [];
      return {
        slug: slugify(d.title, d.id),
        title: d.title,
        subtitle: d.subtitle,
        lead: d.lead,
        body: d.bodyDraft,
        questions: parseJsonArray<string>(d.questionsJson),
        tags: parseJsonArray<string>(d.tagsJson),
        sourceVideoIds: videos.map((v) => v.videoId),
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      };
    })
  );

  const publicClusters: PublicCluster[] = clusters
    .filter((c) => c.summary)
    .map((c) => ({
      slug: slugify(c.title, c.id),
      title: c.title,
      description: c.description,
      summary: c.summary ?? "",
      question: c.question,
      articleAngles: parseJsonArray<string>(c.articleAnglesJson ?? "[]"),
      tags: parseJsonArray<string>(c.tagsJson),
      sourceVideoIds: c.items
        .filter((item) => isExportablePublishStatus(item.video.publishStatus))
        .map((item) => item.video.videoId),
    }));

  const fieldNoteSlugByVideoId = new Map<string, string>();
  for (const fn of fieldNotes) {
    if (fn.sourceVideoIds[0]) {
      fieldNoteSlugByVideoId.set(fn.sourceVideoIds[0], fn.slug);
    }
  }

  const publicVideosRaw = await prisma.video.findMany({
    where: { publishStatus: { in: exportable } },
    include: { analysis: true },
    orderBy: { publishedAt: "desc" },
  });

  const videos: PublicVideo[] = publicVideosRaw
    .filter(
      (v) =>
        !v.analysis || isExportablePublishStatus(v.analysis.publishStatus)
    )
    .map((v) => {
      const a = v.analysis;
      const displayTitle =
        a?.fieldNoteTitle?.trim() || v.publicNote?.trim() || v.title;
      let curationRole: PublicVideo["curationRole"] = "reference";
      if (v.curationStatus === "meaning_layer_candidate") {
        curationRole = "meaning_layer";
      } else if (a) {
        curationRole = "field_note";
      }

      return {
        id: v.videoId,
        slug: slugify(displayTitle, v.videoId),
        title: v.title,
        displayTitle,
        publicNote: v.publicNote?.trim() ?? "",
        channelTitle: v.channelTitle,
        url: v.url,
        thumbnailUrl: v.thumbnailUrl,
        publishedAt: v.publishedAt.toISOString(),
        seedKeyword: v.seedKeyword,
        category: a?.category ?? "—",
        vanishingLifeScore: a?.vanishingLifeScore ?? 0,
        tags: a ? parseJsonArray<string>(a.tagsJson) : [],
        curationRole,
        fieldNoteSlug: fieldNoteSlugByVideoId.get(v.videoId) ?? null,
      };
    });

  const sourceVideos: PublicSourceVideo[] = videos.map((v) => ({
    id: v.id,
    title: v.title,
    channelTitle: v.channelTitle,
    url: v.url,
    thumbnailUrl: v.thumbnailUrl,
    publishedAt: v.publishedAt,
  }));

  return {
    generatedAt: new Date().toISOString(),
    fieldNotes,
    meaningLayer,
    articles: publicArticles,
    clusters: publicClusters,
    videos,
    sourceVideos,
  };
}

export function publicBundleToMarkdown(bundle: PublicBundle): string {
  const lines: string[] = [
    "# Vanishing Life Archive — Public Export",
    "",
    `Generated: ${bundle.generatedAt}`,
    "",
  ];

  if (bundle.fieldNotes.length > 0) {
    lines.push("## Field Notes", "");
    for (const fn of bundle.fieldNotes) {
      lines.push(`### ${fn.title}`, "");
      if (fn.subtitle) lines.push(fn.subtitle, "");
      lines.push(`category: ${fn.category}`, "", fn.body, "", `> ${fn.question}`, "");
    }
  }

  if (bundle.meaningLayer.length > 0) {
    lines.push("## Meaning Layer", "");
    for (const ml of bundle.meaningLayer) {
      lines.push(`### ${ml.title}`, "");
      if (ml.subtitle) lines.push(ml.subtitle, "");
      lines.push(
        `category: ${ml.category}`,
        "",
        "**Observe**",
        ml.observe,
        "",
        "**Sample**",
        ml.sample,
        "",
        "**Recombine**",
        ml.recombine,
        "",
        `> ${ml.question}`,
        ""
      );
    }
  }

  if (bundle.articles.length > 0) {
    lines.push("## Articles", "");
    for (const a of bundle.articles) {
      lines.push(`### ${a.title}`, "");
      if (a.subtitle) lines.push(a.subtitle, "");
      lines.push(a.lead, "", a.body, "");
    }
  }

  if (bundle.videos.length > 0) {
    lines.push("## Videos", "");
    for (const v of bundle.videos) {
      lines.push(`### ${v.displayTitle}`, "");
      if (v.publicNote) lines.push(v.publicNote, "");
      lines.push(
        `channel: ${v.channelTitle}`,
        `category: ${v.category}`,
        `url: ${v.url}`,
        ""
      );
    }
  }

  if (bundle.clusters.length > 0) {
    lines.push("## Clusters", "");
    for (const c of bundle.clusters) {
      lines.push(`### ${c.title}`, "", c.description, "", c.summary, "");
    }
  }

  return lines.join("\n");
}

export async function getExportQueue(): Promise<{
  fieldNotes: ExportQueueItem[];
  meaningLayer: ExportQueueItem[];
  articles: ExportQueueItem[];
  clusters: ExportQueueItem[];
  videos: ExportQueueItem[];
}> {
  const [analyses, articles, clusters, publicVideos] = await Promise.all([
    prisma.analysis.findMany({
      where: { publishStatus: "public_ready" },
      include: { video: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.articleDraft.findMany({
      where: { publishStatus: "public_ready" },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.cluster.findMany({
      where: { publishStatus: "public_ready" },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.video.findMany({
      where: { publishStatus: "public_ready" },
      include: { analysis: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const fieldNoteAnalyses = analyses.filter(
    (a) => a.video.curationStatus !== "meaning_layer_candidate"
  );
  const meaningLayerVideos = await prisma.video.findMany({
    where: {
      curationStatus: "meaning_layer_candidate",
      publishStatus: "public_ready",
    },
    include: { analysis: true },
    orderBy: { updatedAt: "desc" },
  });

  return {
    fieldNotes: fieldNoteAnalyses.map((a) => ({
      id: a.id,
      kind: "fieldNote" as const,
      title: a.fieldNoteTitle,
      publishStatus: a.publishStatus,
      updatedAt: a.updatedAt.toISOString(),
    })),
    meaningLayer: meaningLayerVideos.map((v) => ({
      id: v.id,
      kind: "meaningLayer" as const,
      title: v.analysis?.fieldNoteTitle?.trim() || v.title,
      publishStatus: v.publishStatus,
      updatedAt: v.updatedAt.toISOString(),
    })),
    articles: articles.map((a) => ({
      id: a.id,
      kind: "article" as const,
      title: a.title,
      publishStatus: a.publishStatus,
      updatedAt: a.updatedAt.toISOString(),
    })),
    clusters: clusters.map((c) => ({
      id: c.id,
      kind: "cluster" as const,
      title: c.title,
      publishStatus: c.publishStatus,
      updatedAt: c.updatedAt.toISOString(),
    })),
    videos: publicVideos.map((v) => ({
      id: v.id,
      kind: "video" as const,
      title: v.analysis?.fieldNoteTitle?.trim() || v.title,
      publishStatus: v.publishStatus,
      updatedAt: v.updatedAt.toISOString(),
    })),
  };
}

export async function getPublicPreviewData() {
  return buildPublicBundle();
}
