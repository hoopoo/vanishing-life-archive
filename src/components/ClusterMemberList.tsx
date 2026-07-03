"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClusterVideoCardBody } from "@/components/ClusterVideoCardBody";
import { CLUSTER_ITEM_NOTE_PLACEHOLDER } from "@/lib/cluster-candidates";
import type { SerializedClusterItem } from "@/lib/cluster-types";

export function ClusterMemberList({
  items,
}: {
  items: SerializedClusterItem[];
}) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function handleRemove(itemId: number) {
    setRemovingId(itemId);
    setMessage("");

    const res = await fetch(`/api/cluster-items/${itemId}`, {
      method: "DELETE",
    });

    setRemovingId(null);

    if (res.ok) {
      router.refresh();
    } else {
      setMessage("削除に失敗しました");
    }
  }

  async function handleNoteSave(itemId: number, note: string) {
    setSavingNoteId(itemId);
    await fetch(`/api/cluster-items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setSavingNoteId(null);
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-3">
      {message && <p className="text-xs text-stone-600">{message}</p>}
      {items.map((item) => {
        const video = item.video!;
        return (
          <div
            key={item.id}
            className="border border-stone-200 bg-white p-4"
          >
            <ClusterVideoCardBody video={video} />

            <label className="mt-3 block border-t border-stone-100 pt-3 text-xs text-stone-600">
              このClusterに入れる理由
              <textarea
                key={`${item.id}-${item.note ?? ""}`}
                defaultValue={item.note ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (item.note ?? "")) {
                    void handleNoteSave(item.id, e.target.value);
                  }
                }}
                rows={2}
                placeholder={CLUSTER_ITEM_NOTE_PLACEHOLDER}
                disabled={savingNoteId === item.id}
                className="mt-1 w-full border border-stone-300 px-2 py-1.5 text-sm leading-relaxed disabled:opacity-50"
              />
            </label>

            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              disabled={removingId === item.id}
              className="mt-2 text-xs text-stone-500 hover:text-stone-800 disabled:opacity-50"
            >
              {removingId === item.id ? "削除中…" : "Clusterから削除"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
