import Link from "next/link";
import { Header, Footer } from "@/components/Header";
import { CategoryBadge } from "@/components/ProtocolDisplay";
import { ClusterItemCountLabel } from "@/components/ClusterItemCountLabel";
import { PublicObservatoryCandidateCard } from "@/components/PublicObservatoryCandidateCard";
import { getPublicDashboardStats } from "@/lib/public-stats";

export default async function PublicPreviewHomePage() {
  const stats = await getPublicDashboardStats();

  return (
    <>
      <Header mode="public" />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
        <section className="mb-10 max-w-3xl">
          <p className="text-xs tracking-widest text-stone-500 uppercase">
            Field Note Observatory
          </p>
          <h2 className="mt-2 font-serif text-3xl leading-snug text-stone-900">
            生活は、消える直前に撮られはじめる。
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-stone-700">
            YouTube上の名もない生活記録を、未来の民俗資料として観測・分類・解釈する。
            これは動画検索ツールではなく、消失する日常の観測台帳である。
          </p>
        </section>

        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "公開の生活断片", value: stats.videoCount },
            { label: "Field Notes", value: stats.fieldNoteCount },
            {
              label: "公開待ち（未分析）",
              value: stats.unanalyzedPublicCount,
            },
            { label: "Seed Keywords", value: stats.activeSeedCount },
          ].map((item) => (
            <div
              key={item.label}
              className="border border-stone-200 bg-white p-4"
            >
              <p className="text-xs text-stone-500">{item.label}</p>
              <p className="mt-1 font-serif text-3xl text-stone-900">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <h3 className="mb-4 font-serif text-xl text-stone-900">
              最新の Field Notes
            </h3>
            <div className="space-y-3">
              {stats.recentFieldNotes.length === 0 ? (
                <p className="text-sm text-stone-500">
                  公開対象の Field Note がありません。
                </p>
              ) : (
                stats.recentFieldNotes.map((note) => (
                  <Link
                    key={note.videoId}
                    href={`/public-preview/videos/${note.videoId}`}
                    className="block border border-stone-200 bg-white p-4 transition hover:border-stone-400"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-serif text-stone-900">
                        {note.fieldNoteTitle}
                      </p>
                      <span className="shrink-0 font-mono text-sm text-stone-600">
                        {note.vanishingLifeScore}
                      </span>
                    </div>
                    <CategoryBadge category={note.category} />
                  </Link>
                ))
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-4 font-serif text-xl text-stone-900">
              高スコア動画
            </h3>
            <div className="space-y-3">
              {stats.topVideos.map((video) => (
                <Link
                  key={video.videoId}
                  href={`/public-preview/videos/${video.videoId}`}
                  className="flex items-center justify-between border border-stone-200 bg-white p-4 transition hover:border-stone-400"
                >
                  <div>
                    <p className="text-sm text-stone-900">{video.title}</p>
                    <CategoryBadge category={video.category} />
                  </div>
                  <span className="font-mono text-lg text-stone-700">
                    {video.vanishingLifeScore}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section>
            <h3 className="mb-4 font-serif text-xl text-stone-900">
              Article Candidates
            </h3>
            <p className="mb-3 text-xs text-stone-500">
              記事化候補 — 人間が選別した生活断片
            </p>
            <div className="space-y-3">
              {stats.articleCandidates.length === 0 ? (
                <p className="text-sm text-stone-500">
                  公開対象の Article 候補がありません。
                </p>
              ) : (
                stats.articleCandidates.map((item) => (
                  <PublicObservatoryCandidateCard
                    key={item.videoId}
                    {...item}
                  />
                ))
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-4 font-serif text-xl text-stone-900">
              Meaning Layer Candidates
            </h3>
            <p className="mb-3 text-xs text-stone-500">
              Meaning Layer 送付候補 — 意味層へ渡す断片
            </p>
            <div className="space-y-3">
              {stats.meaningLayerCandidates.length === 0 ? (
                <p className="text-sm text-stone-500">
                  公開対象の Meaning Layer 候補がありません。
                </p>
              ) : (
                stats.meaningLayerCandidates.map((item) => (
                  <PublicObservatoryCandidateCard
                    key={item.videoId}
                    {...item}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="font-serif text-xl text-stone-900">
                Clusters — 消失シグナルの束
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                同じ消え方をしている生活断片を束ねる
              </p>
            </div>
            <Link
              href="/public-preview/clusters"
              className="text-xs text-stone-600 underline"
            >
              すべて見る →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.clusters.length === 0 ? (
              <p className="text-sm text-stone-500 sm:col-span-2 lg:col-span-3">
                公開対象の Cluster がありません。
              </p>
            ) : (
              stats.clusters.map((cluster) => (
                <Link
                  key={cluster.id}
                  href={`/public-preview/clusters`}
                  className="block border border-stone-200 bg-[#faf8f5] p-4 transition hover:border-stone-400"
                >
                  <p className="font-serif text-stone-900">{cluster.title}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-stone-600 italic">
                    {cluster.question}
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <ClusterItemCountLabel
                      itemCount={cluster.itemCount}
                      candidateCount={cluster.candidateCount}
                    />
                    <div className="flex flex-wrap justify-end gap-1">
                      {cluster.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="border border-stone-200 px-1.5 py-0.5 text-[10px] text-stone-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="mt-10">
          <h3 className="mb-4 font-serif text-xl text-stone-900">
            カテゴリ別件数
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(stats.categoryCounts).map(([cat, count]) => (
              <div
                key={cat}
                className="flex justify-between border border-stone-200 bg-white px-4 py-2 text-sm"
              >
                <span className="text-stone-700">{cat}</span>
                <span className="font-mono text-stone-900">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h3 className="mb-4 font-serif text-xl text-stone-900">
            Seed Keywords（消失シグナル）
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.seeds.slice(0, 12).map((seed) => (
              <span
                key={seed.id}
                className="border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600"
              >
                {seed.keyword}
              </span>
            ))}
            {stats.seeds.length > 12 && (
              <span className="text-xs text-stone-500">
                他 {stats.seeds.length - 12} 件
              </span>
            )}
          </div>
        </section>
      </main>
      <Footer mode="public" />
    </>
  );
}
