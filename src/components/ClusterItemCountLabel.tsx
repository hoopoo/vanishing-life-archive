export function clusterDisplayCount(itemCount: number, candidateCount: number) {
  if (itemCount > 0) return itemCount;
  return candidateCount;
}

export function ClusterItemCountLabel({
  itemCount,
  candidateCount = 0,
}: {
  itemCount: number;
  candidateCount?: number;
}) {
  if (itemCount > 0) {
    return (
      <span className="text-xs text-stone-500">{itemCount} 件の観測断片</span>
    );
  }

  if (candidateCount > 0) {
    return (
      <div className="text-xs text-stone-500">
        <p className="tracking-wide text-stone-400 uppercase">Seed Cluster</p>
        <p className="mt-0.5">候補 {candidateCount} 件の生活断片</p>
        <p className="mt-0.5 text-[10px] text-stone-400">未割当 — 詳細から追加可</p>
      </div>
    );
  }

  return (
    <div className="text-xs text-stone-500">
      <p className="tracking-wide text-stone-400 uppercase">Seed Cluster</p>
      <p className="mt-0.5">まだ観測断片は入っていません</p>
    </div>
  );
}
