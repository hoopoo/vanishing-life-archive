"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClusterVideoCardBody } from "@/components/ClusterVideoCardBody";
import { CLUSTER_ITEM_NOTE_PLACEHOLDER } from "@/lib/cluster-candidates";
import type { SerializedClusterVideo } from "@/lib/cluster-types";

export function ClusterCandidateList({
  clusterId,
  candidates,
}: {
  clusterId: number;
  candidates: SerializedClusterVideo[];
}) {
  const router = useRouter();
  const [addingId, setAddingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState("");

  const visible = candidates.filter((c) => !addedIds.has(c.id));

  function toggleExpand(videoId: number) {
    setExpandedId((prev) => (prev === videoId ? null : videoId));
  }

  async function handleAdd(videoId: number) {
    setAddingId(videoId);
    setMessage("");

    const res = await fetch(`/api/clusters/${clusterId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, note: notes[videoId] || undefined }),
    });

    setAddingId(null);

    if (res.ok) {
      setAddedIds((prev) => new Set(prev).add(videoId));
      setExpandedId(null);
      setMessage("Clusterに追加しました");
      router.refresh();
    } else {
      setMessage("追加に失敗しました");
    }
  }

  if (visible.length === 0) {
    return (
      <p className="mt-4 text-sm text-stone-500">
        現在、ルールに合う候補動画は見つかりませんでした。
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {message && <p className="text-xs text-stone-600">{message}</p>}
      {visible.map((video) => (
        <div
          key={video.id}
          className="border border-dashed border-stone-300 bg-white p-4"
        >
          <ClusterVideoCardBody video={video} />

          {expandedId === video.id ? (
            <div className="mt-3 border-t border-stone-100 pt-3">
              <label className="block text-xs text-stone-600">
                このClusterに入れる理由（任意）
                <textarea
                  value={notes[video.id] ?? ""}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [video.id]: e.target.value }))
                  }
                  rows={3}
                  placeholder={CLUSTER_ITEM_NOTE_PLACEHOLDER}
                  className="mt-1 w-full border border-stone-300 px-2 py-1.5 text-sm leading-relaxed"
                />
              </label>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAdd(video.id)}
                  disabled={addingId === video.id}
                  className="border border-stone-800 px-3 py-1.5 text-xs text-stone-900 hover:bg-stone-50 disabled:opacity-50"
                >
                  {addingId === video.id ? "追加中…" : "追加する"}
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedId(null)}
                  className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => toggleExpand(video.id)}
              className="mt-3 border border-stone-400 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50"
            >
              このClusterに追加
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
