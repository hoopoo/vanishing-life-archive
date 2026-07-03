import Link from "next/link";
import { Header, Footer } from "@/components/Header";
import { ClusterItemCountLabel } from "@/components/ClusterItemCountLabel";
import { getClusters } from "@/lib/clusters";

export default async function ClustersPage() {
  const clusters = await getClusters();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-8">
        <p className="text-xs tracking-widest text-stone-500 uppercase">
          生活断片を束ねる
        </p>
        <h2 className="mt-1 font-serif text-2xl text-stone-900">Clusters</h2>
        <p className="mt-2 text-sm text-stone-600">
          消失シグナルの束 — 同じ消え方をしている生活断片を、意味のまとまりとして観測する。
        </p>

        <div className="mt-8 space-y-4">
          {clusters.map((cluster) => (
            <Link
              key={cluster.id}
              href={`/clusters/${cluster.id}`}
              className="block border border-stone-200 bg-white p-5 transition hover:border-stone-400"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-lg text-stone-900">
                    {cluster.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">
                    {cluster.description}
                  </p>
                  <p className="mt-3 text-sm text-stone-600 italic">
                    {cluster.question}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <ClusterItemCountLabel
                    itemCount={cluster.itemCount}
                    candidateCount={cluster.candidateCount}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {cluster.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-stone-200 px-2 py-0.5 text-xs text-stone-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
