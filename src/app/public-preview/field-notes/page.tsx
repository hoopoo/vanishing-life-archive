import Link from "next/link";
import { Header, Footer } from "@/components/Header";
import { getPublicPreviewData } from "@/lib/public-export";

export default async function PublicFieldNotesPage() {
  const bundle = await getPublicPreviewData();

  return (
    <>
      <Header mode="public" />
      <main className="mx-auto max-w-4xl flex-1 px-4 py-8">
        <Link href="/public-preview" className="text-xs text-stone-500 underline">
          ← Public Preview
        </Link>
        <h2 className="mt-4 font-serif text-2xl text-stone-900">Field Notes</h2>
        <div className="mt-6 space-y-6">
          {bundle.fieldNotes.length === 0 ? (
            <p className="text-sm text-stone-500">公開対象の Field Note がありません。</p>
          ) : (
            bundle.fieldNotes.map((fn) => (
              <article
                key={fn.slug}
                id={fn.slug}
                className="border border-stone-200 bg-white p-5"
              >
                <p className="text-xs text-stone-500">{fn.category}</p>
                <h3 className="mt-1 font-serif text-xl text-stone-900">
                  {fn.title}
                </h3>
                {fn.subtitle && (
                  <p className="mt-2 text-sm text-stone-600">{fn.subtitle}</p>
                )}
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
                  {fn.body}
                </p>
                <p className="mt-4 text-sm italic text-stone-700">{fn.question}</p>
              </article>
            ))
          )}
        </div>
      </main>
      <Footer mode="public" />
    </>
  );
}
