import { Header, Footer } from "@/components/Header";
import { VideoFilters } from "@/components/VideoFilters";
import { VideoListItem } from "@/components/VideoListItem";
import { CATEGORIES } from "@/lib/constants";
import { getClusterVideoIds, getClusters } from "@/lib/clusters";
import { prisma } from "@/lib/prisma";
import { filterVideos, serializeVideo } from "@/lib/videos";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    seedKeyword?: string;
    status?: string;
    curationStatus?: string;
    minScore?: string;
    maxScore?: string;
    isFeatured?: string;
    clusterId?: string;
  }>;
}

export default async function VideosPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const clusterId = params.clusterId ? Number(params.clusterId) : null;
  const clusterVideoIds =
    clusterId && !Number.isNaN(clusterId)
      ? await getClusterVideoIds(clusterId)
      : undefined;

  const [videosRaw, seeds, clusters] = await Promise.all([
    prisma.video.findMany({
      include: { analysis: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.seedKeyword.findMany({ orderBy: { keyword: "asc" } }),
    getClusters(),
  ]);

  const videos = filterVideos(videosRaw.map(serializeVideo), {
    category: params.category ?? "",
    seedKeyword: params.seedKeyword ?? "",
    status: params.status ?? "",
    curationStatus: params.curationStatus ?? "",
    minScore: params.minScore ?? "",
    maxScore: params.maxScore ?? "",
    isFeatured: params.isFeatured ?? "",
    clusterVideoIds,
  });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
        <h2 className="font-serif text-2xl text-stone-900">生活の断片</h2>
        <p className="mt-1 text-sm text-stone-600">
          観測台帳 — 選別・意味づけ・記事化候補の管理
        </p>

        <VideoFilters
          categories={[...CATEGORIES]}
          seeds={seeds.map((s) => s.keyword)}
          clusters={clusters.map((c) => ({ id: c.id, title: c.title }))}
          values={{
            category: params.category ?? "",
            seedKeyword: params.seedKeyword ?? "",
            status: params.status ?? "",
            curationStatus: params.curationStatus ?? "",
            minScore: params.minScore ?? "",
            maxScore: params.maxScore ?? "",
            isFeatured: params.isFeatured ?? "",
            clusterId: params.clusterId ?? "",
          }}
        />

        {videos.length === 0 ? (
          <p className="mt-8 text-sm text-stone-500">
            該当する動画がありません。
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {videos.map((video) => (
              <VideoListItem key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
