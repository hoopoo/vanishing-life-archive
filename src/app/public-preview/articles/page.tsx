import Link from "next/link";
import { Header, Footer } from "@/components/Header";
import { getPublicPreviewData } from "@/lib/public-export";

export default async function PublicArticlesPage() {
  const bundle = await getPublicPreviewData();

  return (
    <>
      <Header mode="public" />
      <main className="mx-auto max-w-4xl flex-1 px-4 py-8">
        <Link href="/public-preview" className="text-xs text-stone-500 underline">
          ← Public Preview
        </Link>
        <h2 className="mt-4 font-serif text-2xl text-stone-900">Articles</h2>
        <div className="mt-6 space-y-8">
          {bundle.articles.length === 0 ? (
            <p className="text-sm text-stone-500">公開対象の Article がありません。</p>
          ) : (
            bundle.articles.map((a) => (
              <article
                key={a.slug}
                className="border border-stone-200 bg-white p-5"
              >
                <h3 className="font-serif text-xl text-stone-900">{a.title}</h3>
                {a.subtitle && (
                  <p className="mt-1 text-sm text-stone-600">{a.subtitle}</p>
                )}
                <p className="mt-4 text-sm leading-relaxed text-stone-800">
                  {a.lead}
                </p>
                <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
                  {a.body}
                </div>
              </article>
            ))
          )}
        </div>
      </main>
      <Footer mode="public" />
    </>
  );
}
