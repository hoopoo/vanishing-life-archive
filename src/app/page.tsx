import Link from "next/link";
import { Header, Footer } from "@/components/Header";
import { CategoryBadge } from "@/components/ProtocolDisplay";
import { ObservatoryCandidateCard } from "@/components/ObservatoryCandidateCard";
import { ClusterItemCountLabel } from "@/components/ClusterItemCountLabel";
import { getDashboardStats, getSeedKeywords } from "@/lib/stats";

export default async function HomePage() {
  const [stats, seeds] = await Promise.all([
    getDashboardStats(),
    getSeedKeywords(),
  ]);

  return (
    <>
      <Header />
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

        {stats && (
          <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "生活の断片", value: stats.videoCount },
              { label: "Field Notes", value: stats.analyzedCount },
              { label: "まだ意味づけられていない", value: stats.unanalyzedCount },
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
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <h3 className="mb-4 font-serif text-xl text-stone-900">
              最新の Field Notes
            </h3>
            <div className="space-y-3">
              {(stats?.recentFieldNotes ?? []).length === 0 ? (
                <p className="text-sm text-stone-500">
                  まだ Field Note がありません。Run Observation から mock data
                  を投入してください。
                </p>
              ) : (
                stats.recentFieldNotes.map(
                  (note: {
                    id: number;
                    videoDbId: number;
                    fieldNoteTitle: string;
                    category: string;
                    vanishingLifeScore: number;
                  }) => (
                    <Link
                      key={note.id}
                      href={`/videos/${note.videoDbId}`}
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
                  )
                )
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-4 font-serif text-xl text-stone-900">
              高スコア動画
            </h3>
            <div className="space-y-3">
              {(stats?.topVideos ?? []).map(
                (video: {
                  id: number;
                  title: string;
                  vanishingLifeScore: number;
                  category: string;
                }) => (
                  <Link
                    key={video.id}
                    href={`/videos/${video.id}`}
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
                )
              )}
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
              {(stats?.articleCandidates ?? []).length === 0 ? (
                <p className="text-sm text-stone-500">
                  候補がありません。Videos ページで Article
                  ボタンを押して選別してください。
                </p>
              ) : (
                stats.articleCandidates.map((item) => (
                  <ObservatoryCandidateCard key={item.id} {...item} />
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
              {(stats?.meaningLayerCandidates ?? []).length === 0 ? (
                <p className="text-sm text-stone-500">
                  候補がありません。Videos ページで Meaning Layer
                  ボタンを押して選別してください。
                </p>
              ) : (
                stats.meaningLayerCandidates.map((item) => (
                  <ObservatoryCandidateCard key={item.id} {...item} />
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
              href="/clusters"
              className="text-xs text-stone-600 underline"
            >
              すべて見る →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(stats?.clusters ?? []).length === 0 ? (
              <p className="text-sm text-stone-500 sm:col-span-2 lg:col-span-3">
                Cluster がありません。
              </p>
            ) : (
              stats.clusters.map(
                (cluster: {
                  id: number;
                  title: string;
                  question: string;
                  itemCount: number;
                  candidateCount: number;
                  tags: string[];
                }) => (
                  <Link
                    key={cluster.id}
                    href={`/clusters/${cluster.id}`}
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
                        {cluster.tags.slice(0, 3).map((tag: string) => (
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
                )
              )
            )}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="font-serif text-xl text-stone-900">
                Article Drafts
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                Field Notes から生まれた記事の種 — book.shiroand.io へ渡す前
              </p>
            </div>
            <Link
              href="/article-studio"
              className="text-xs text-stone-600 underline"
            >
              Article Studio →
            </Link>
          </div>
          <div className="space-y-3">
            {(stats?.articleDrafts ?? []).length === 0 ? (
              <p className="text-sm text-stone-500">
                まだ Article Draft がありません。
              </p>
            ) : (
              stats.articleDrafts.map(
                (draft: {
                  id: number;
                  title: string;
                  subtitle: string;
                  theme: string;
                  status: string;
                  createdAt: string;
                }) => (
                  <Link
                    key={draft.id}
                    href={`/article-studio/${draft.id}`}
                    className="block border border-stone-200 bg-white p-4 transition hover:border-stone-400"
                  >
                    <p className="font-serif text-stone-900">{draft.title}</p>
                    {draft.subtitle && (
                      <p className="text-xs text-stone-500">{draft.subtitle}</p>
                    )}
                    <p className="mt-1 text-xs text-stone-500">
                      {draft.theme} · {draft.status}
                    </p>
                  </Link>
                )
              )
            )}
          </div>
        </section>

        <section className="mt-10">
          <h3 className="mb-4 font-serif text-xl text-stone-900">
            カテゴリ別件数
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(stats?.categoryCounts ?? {}).map(([cat, count]) => (
              <div
                key={cat}
                className="flex justify-between border border-stone-200 bg-white px-4 py-2 text-sm"
              >
                <span className="text-stone-700">{cat}</span>
                <span className="font-mono text-stone-900">{count as number}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h3 className="mb-4 font-serif text-xl text-stone-900">
            Seed Keywords（消失シグナル）
          </h3>
          <div className="flex flex-wrap gap-2">
            {seeds.slice(0, 12).map((seed: { id: number; keyword: string }) => (
              <span
                key={seed.id}
                className="border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600"
              >
                {seed.keyword}
              </span>
            ))}
            {seeds.length > 12 && (
              <Link href="/seeds" className="text-xs text-stone-500 underline">
                すべて見る ({seeds.length})
              </Link>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
