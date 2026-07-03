import type { SerializedCluster } from "@/lib/cluster-types";

export function ClusterSummaryDisplay({ cluster }: { cluster: SerializedCluster }) {
  if (!cluster.summary && !cluster.hypothesis) return null;

  return (
    <section className="mt-8 border border-stone-200 bg-[#faf8f5] p-4">
      <h3 className="text-xs tracking-widest text-stone-500 uppercase">
        Cluster Summary
      </h3>

      {cluster.summary && (
        <div className="mt-4">
          <h4 className="text-xs text-stone-500">観測要約</h4>
          <p className="mt-2 text-sm leading-relaxed text-stone-800">
            {cluster.summary}
          </p>
        </div>
      )}

      {cluster.hypothesis && (
        <div className="mt-4">
          <h4 className="text-xs text-stone-500">現時点の仮説</h4>
          <p className="mt-2 text-sm leading-relaxed text-stone-800 italic">
            {cluster.hypothesis}
          </p>
        </div>
      )}

      {cluster.articleAngles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs text-stone-500">記事化の切り口</h4>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-stone-700">
            {cluster.articleAngles.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {cluster.generatedQuestions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs text-stone-500">問い</h4>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-stone-700">
            {cluster.generatedQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {cluster.recommendedTitle && (
        <div className="mt-4">
          <h4 className="text-xs text-stone-500">推奨タイトル</h4>
          <p className="mt-2 font-serif text-stone-900">
            {cluster.recommendedTitle}
          </p>
        </div>
      )}
    </section>
  );
}
