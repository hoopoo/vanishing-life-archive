import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/Header";
import { ArticleDraftEditor } from "@/components/ArticleDraftEditor";
import { getArticleDraftById } from "@/lib/article";

export default async function ArticleDraftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const draft = await getArticleDraftById(Number(id));

  if (!draft) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl flex-1 px-4 py-8">
        <Link
          href="/article-studio"
          className="text-xs text-stone-500 underline"
        >
          ← Article Studio に戻る
        </Link>

        <p className="mt-4 text-xs tracking-widest text-stone-500 uppercase">
          Article Draft #{draft.id}
        </p>
        <h2 className="mt-1 font-serif text-2xl text-stone-900">
          {draft.title}
        </h2>
        {draft.subtitle && (
          <p className="mt-1 text-sm text-stone-600">{draft.subtitle}</p>
        )}

        <div className="mt-4 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
          <p>
            <span className="text-stone-500">theme:</span> {draft.theme}
          </p>
          <p>
            <span className="text-stone-500">angle:</span> {draft.angle}
          </p>
          <p>
            <span className="text-stone-500">status:</span> {draft.status}
          </p>
          <p>
            <span className="text-stone-500">created:</span>{" "}
            {new Date(draft.createdAt).toLocaleString("ja-JP")}
          </p>
        </div>

        <section className="mt-6 border border-stone-200 bg-[#faf8f5] p-4">
          <h3 className="text-xs tracking-widest text-stone-500 uppercase">
            Lead
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-800">
            {draft.lead}
          </p>
        </section>

        <ArticleDraftEditor key={draft.updatedAt} draft={draft} />
      </main>
      <Footer />
    </>
  );
}
