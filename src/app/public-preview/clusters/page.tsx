import Link from "next/link";
import { Header, Footer } from "@/components/Header";
import { getPublicPreviewData } from "@/lib/public-export";

export default async function PublicClustersPage() {
  const bundle = await getPublicPreviewData();

  return (
    <>
      <Header mode="public" />
      <main className="mx-auto max-w-4xl flex-1 px-4 py-8">
        <Link href="/public-preview" className="text-xs text-stone-500 underline">
          ← Public Preview
        </Link>
        <h2 className="mt-4 font-serif text-2xl text-stone-900">Clusters</h2>
        <div className="mt-6 space-y-6">
          {bundle.clusters.length === 0 ? (
            <p className="text-sm text-stone-500">公開対象の Cluster がありません。</p>
          ) : (
            bundle.clusters.map((c) => (
              <article
                key={c.slug}
                className="border border-stone-200 bg-[#faf8f5] p-5"
              >
                <h3 className="font-serif text-xl text-stone-900">{c.title}</h3>
                <p className="mt-2 text-sm text-stone-700">{c.description}</p>
                <p className="mt-4 text-sm leading-relaxed text-stone-800">
                  {c.summary}
                </p>
                <p className="mt-3 text-sm italic text-stone-700">{c.question}</p>
              </article>
            ))
          )}
        </div>
      </main>
      <Footer mode="public" />
    </>
  );
}
