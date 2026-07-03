import Link from "next/link";
import { Header, Footer } from "@/components/Header";
import { ArticleStudioPanel } from "@/components/ArticleStudioPanel";
import { getArticleCandidates, getArticleDrafts } from "@/lib/article";
import { getClusters } from "@/lib/clusters";

interface PageProps {
  searchParams: Promise<{ clusterId?: string }>;
}

export default async function ArticleStudioPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialClusterId = params.clusterId
    ? Number(params.clusterId)
    : undefined;

  const [candidates, drafts, clusters] = await Promise.all([
    getArticleCandidates(),
    getArticleDrafts(),
    getClusters(),
  ]);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-8">
        <p className="text-xs tracking-widest text-stone-500 uppercase">
          Field Notesから記事の種を作る
        </p>
        <h2 className="mt-1 font-serif text-2xl text-stone-900">
          Article Studio
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          生活の断片を束ね、共通する消失シグナルを見つけ、book.shiroand.io
          へ渡す記事の種を作る。
        </p>

        <section className="mt-8">
          <h3 className="font-serif text-lg text-stone-900">記事の種を選ぶ</h3>
          <p className="mt-1 text-xs text-stone-500">
            Article Candidate から手動選択、または Cluster からまとめて選択
          </p>
          <ArticleStudioPanel
            candidates={candidates}
            clusters={clusters}
            initialClusterId={
              initialClusterId && !Number.isNaN(initialClusterId)
                ? initialClusterId
                : undefined
            }
          />
        </section>

        <section className="mt-12 border-t border-stone-200 pt-8">
          <h3 className="font-serif text-lg text-stone-900">
            生成済み Article Drafts
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            まだ book.shiroand.io には渡していない下書き
          </p>

          {drafts.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">
              まだ Article Draft がありません。
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {drafts.map((draft) => (
                <Link
                  key={draft.id}
                  href={`/article-studio/${draft.id}`}
                  className="flex flex-col gap-1 border border-stone-200 bg-white p-4 transition hover:border-stone-400 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-serif text-stone-900">{draft.title}</p>
                    {draft.subtitle && (
                      <p className="text-xs text-stone-500">{draft.subtitle}</p>
                    )}
                    <p className="mt-1 text-xs text-stone-500">
                      theme: {draft.theme}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-stone-500">
                    <span className="border border-stone-300 px-2 py-0.5">
                      {draft.status}
                    </span>
                    <span>
                      {new Date(draft.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
