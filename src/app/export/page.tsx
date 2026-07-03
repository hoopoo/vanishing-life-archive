import Link from "next/link";
import { Header, Footer } from "@/components/Header";
import { getExportQueue, buildPublicBundle } from "@/lib/public-export";

export default async function ExportPage() {
  const [queue, bundle] = await Promise.all([
    getExportQueue(),
    buildPublicBundle(),
  ]);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-8">
        <p className="text-xs tracking-widest text-stone-500 uppercase">
          Local → Public
        </p>
        <h2 className="mt-1 font-serif text-2xl text-stone-900">
          Public Export
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
          publishStatus が public_ready / published
          のコンテンツだけを外部公開用にExportします。Human
          Note、rawJson、APIキー、未整理データは含まれません。
        </p>

        <section className="mt-8 flex flex-wrap gap-3">
          <a
            href="/api/export/bundle"
            className="border border-stone-800 px-4 py-2 text-sm text-stone-900 hover:bg-stone-50"
          >
            Public Bundle JSON
          </a>
          <a
            href="/api/export/markdown"
            className="border border-stone-400 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            Markdown Export
          </a>
          <Link
            href="/public-preview"
            className="border border-stone-400 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            Public Preview →
          </Link>
        </section>

        <div className="mt-6 grid gap-4 text-sm text-stone-600 sm:grid-cols-3 lg:grid-cols-6">
          <p>Videos: {bundle.videos.length}</p>
          <p>Field Notes: {bundle.fieldNotes.length}</p>
          <p>Meaning Layer: {bundle.meaningLayer.length}</p>
          <p>Articles: {bundle.articles.length}</p>
          <p>Clusters: {bundle.clusters.length}</p>
          <p>Source Videos: {bundle.sourceVideos.length}</p>
        </div>

        <ExportSection
          title="public_ready — Videos"
          items={queue.videos}
          editHint="Video Detail で Video の公開ステータスを変更"
        />
        <ExportSection
          title="public_ready — Field Notes"
          items={queue.fieldNotes}
          editHint="Video Detail で Analysis の公開ステータスを変更"
        />
        <ExportSection
          title="public_ready — Meaning Layer"
          items={queue.meaningLayer}
          editHint="Meaning Layer 候補の Video Detail で公開ステータスを変更"
        />
        <ExportSection
          title="public_ready — Article Drafts"
          items={queue.articles}
          editHint="Article Studio で Draft の公開ステータスを変更"
        />
        <ExportSection
          title="public_ready — Cluster Summaries"
          items={queue.clusters}
          editHint="Cluster Detail で公開ステータスを変更"
        />
      </main>
      <Footer />
    </>
  );
}

function ExportSection({
  title,
  items,
  editHint,
}: {
  title: string;
  items: Array<{ id: number; title: string; updatedAt: string }>;
  editHint: string;
}) {
  return (
    <section className="mt-10 border-t border-stone-200 pt-8">
      <h3 className="font-serif text-lg text-stone-900">{title}</h3>
      <p className="mt-1 text-xs text-stone-500">{editHint}</p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">
          public_ready の項目はありません。
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between border border-stone-200 bg-white px-4 py-3 text-sm"
            >
              <span className="font-serif text-stone-900">{item.title}</span>
              <span className="text-xs text-stone-500">
                {new Date(item.updatedAt).toLocaleDateString("ja-JP")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
