"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ClusterDetailActions({
  clusterId,
  itemCount,
}: {
  clusterId: number;
  itemCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const hasItems = itemCount > 0;

  async function handleGenerate() {
    setLoading(true);
    setMessage("");

    const res = await fetch(`/api/clusters/${clusterId}/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    setLoading(false);

    if (res.ok) {
      setMessage("Cluster Summaryを生成しました");
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setMessage(data.error ?? "生成に失敗しました");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-4">
        <div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!hasItems || loading}
            className="border border-stone-800 px-4 py-2 text-sm text-stone-900 hover:bg-stone-50 disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400"
          >
            {loading ? "生成中…" : "Cluster Summaryを生成"}
          </button>
        </div>

        {hasItems ? (
          <Link
            href={`/article-studio?clusterId=${clusterId}`}
            className="border border-stone-400 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            Article Studioで記事化 →
          </Link>
        ) : (
          <span className="border border-stone-200 px-4 py-2 text-sm text-stone-400">
            Article Studioで記事化 →
          </span>
        )}
      </div>

      {!hasItems && (
        <div className="max-w-xl space-y-2 text-sm text-stone-600">
          <p>まだ動画がありません。</p>
          <p>
            Video Detail または候補動画から、この Cluster
            に生活断片を追加してください。
          </p>
          <p>
            Cluster Summary は、所属動画の Field Note と Human Note
            をもとに生成されます。
          </p>
        </div>
      )}

      {message && <p className="text-xs text-stone-600">{message}</p>}
    </div>
  );
}
