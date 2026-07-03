import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/Header";
import { ClusterDetailActions } from "@/components/ClusterDetailActions";
import { ClusterCandidateList } from "@/components/ClusterCandidateList";
import { ClusterMemberList } from "@/components/ClusterMemberList";
import { ClusterSummaryDisplay } from "@/components/ClusterSummaryDisplay";
import { ClusterItemCountLabel } from "@/components/ClusterItemCountLabel";
import { PublishStatusSelect } from "@/components/PublishStatusSelect";
import { getClusterById, getClusterCandidateVideos } from "@/lib/clusters";

export default async function ClusterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clusterId = Number(id);
  const cluster = await getClusterById(clusterId);

  if (!cluster) notFound();

  const candidates = await getClusterCandidateVideos(clusterId, 20);
  const hasItems = cluster.itemCount > 0;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl flex-1 px-4 py-8">
        <Link href="/clusters" className="text-xs text-stone-500 underline">
          ← Clusters に戻る
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest text-stone-500 uppercase">
              消失シグナルの束
            </p>
            <h2 className="mt-1 font-serif text-2xl text-stone-900">
              {cluster.title}
            </h2>
          </div>
          <ClusterItemCountLabel
            itemCount={cluster.itemCount}
            candidateCount={cluster.candidateCount}
          />
        </div>

        <div className="mt-4 space-y-3 text-sm text-stone-700">
          <p className="leading-relaxed">{cluster.description}</p>
          {cluster.theme && (
            <p>
              <span className="text-stone-500">theme:</span> {cluster.theme}
            </p>
          )}
          <p className="italic text-stone-800">{cluster.question}</p>
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

        <div className="mt-6 space-y-4">
          <PublishStatusSelect
            entityType="cluster"
            entityId={cluster.id}
            currentStatus={cluster.publishStatus}
            label="Cluster 公開ステータス"
          />
          <ClusterDetailActions
            clusterId={cluster.id}
            itemCount={cluster.itemCount}
          />
        </div>

        <ClusterSummaryDisplay cluster={cluster} />

        <section className="mt-10 border border-stone-200 bg-[#faf8f5] p-4">
          <h3 className="font-serif text-lg text-stone-900">
            候補となる生活断片
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            この Cluster に入りそうな動画です。まだ確定ではありません。観測者が選び、必要なら
            Human Note を添えてください。
          </p>
          <ClusterCandidateList clusterId={cluster.id} candidates={candidates} />
        </section>

        <section className="mt-10">
          <h3 className="font-serif text-lg text-stone-900">所属動画</h3>
          <p className="mt-1 text-xs text-stone-500">
            観測台帳 — 人間が選んで束ねた生活断片
          </p>

          {!hasItems ? (
            <p className="mt-4 text-sm text-stone-500">
              まだ観測断片は入っていません。上の候補から追加するか、Video
              Detail から追加してください。
            </p>
          ) : (
            <ClusterMemberList items={cluster.items ?? []} />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
