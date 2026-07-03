import Link from "next/link";
import { Header, Footer } from "@/components/Header";
import { getPublicPreviewData } from "@/lib/public-export";

export default async function PublicMeaningLayerPage() {
  const bundle = await getPublicPreviewData();

  return (
    <>
      <Header mode="public" />
      <main className="mx-auto max-w-4xl flex-1 px-4 py-8">
        <Link href="/public-preview" className="text-xs text-stone-500 underline">
          ← Public Preview
        </Link>
        <h2 className="mt-4 font-serif text-2xl text-stone-900">
          Meaning Layer
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          意味層へ渡す断片 — Observe · Sample · Recombine · Question
        </p>
        <div className="mt-6 space-y-6">
          {bundle.meaningLayer.length === 0 ? (
            <p className="text-sm text-stone-500">
              公開対象の Meaning Layer 断片がありません。Videos で Meaning
              Layer 候補に選別し、Video Detail で公開ステータスを public_ready
              に設定してください。
            </p>
          ) : (
            bundle.meaningLayer.map((ml) => (
              <article
                key={ml.slug}
                className="border border-stone-200 bg-white p-5"
              >
                <p className="text-xs text-stone-500">{ml.category}</p>
                <h3 className="mt-1 font-serif text-xl text-stone-900">
                  {ml.title}
                </h3>
                {ml.subtitle && (
                  <p className="mt-2 text-sm text-stone-600">{ml.subtitle}</p>
                )}
                {ml.articleAngle && (
                  <p className="mt-2 text-sm italic text-stone-700">
                    {ml.articleAngle}
                  </p>
                )}
                {!ml.observe && !ml.sample && !ml.recombine && (
                  <p className="mt-4 text-sm text-stone-500">
                    AI分析（Field Note）未生成 — 公開メタデータのみ
                  </p>
                )}
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-stone-800">
                  {ml.observe && (
                    <div>
                      <p className="text-xs tracking-wide text-stone-500 uppercase">
                        Observe
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">{ml.observe}</p>
                    </div>
                  )}
                  {ml.sample && (
                    <div>
                      <p className="text-xs tracking-wide text-stone-500 uppercase">
                        Sample
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">{ml.sample}</p>
                    </div>
                  )}
                  {ml.recombine && (
                    <div>
                      <p className="text-xs tracking-wide text-stone-500 uppercase">
                        Recombine
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">{ml.recombine}</p>
                    </div>
                  )}
                </div>
                {ml.question && (
                  <p className="mt-4 text-sm italic text-stone-700">
                    {ml.question}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </main>
      <Footer mode="public" />
    </>
  );
}
