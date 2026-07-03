"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SerializedCluster } from "@/lib/cluster-types";
import { CLUSTER_ITEM_NOTE_PLACEHOLDER } from "@/lib/cluster-candidates";

interface Membership {
  itemId: number;
  note: string | null;
  cluster: SerializedCluster;
}

export function ClusterMembershipEditor({ videoId }: { videoId: number }) {
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [allClusters, setAllClusters] = useState<SerializedCluster[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState("");
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/videos/${videoId}/clusters`);
    if (res.ok) {
      const data = (await res.json()) as {
        memberships: Membership[];
        allClusters: SerializedCluster[];
      };
      setMemberships(data.memberships);
      setAllClusters(data.allClusters);
    }
    setLoading(false);
  }, [videoId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClusterId) return;

    setMessage("");
    const res = await fetch(`/api/clusters/${selectedClusterId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, note: newNote || undefined }),
    });

    if (res.ok) {
      setSelectedClusterId("");
      setNewNote("");
      setMessage("Clusterに追加しました");
      await load();
      router.refresh();
    } else {
      setMessage("追加に失敗しました");
    }
  }

  async function handleRemove(itemId: number) {
    setMessage("");
    const res = await fetch(`/api/cluster-items/${itemId}`, { method: "DELETE" });
    if (res.ok) {
      await load();
      router.refresh();
    } else {
      setMessage("削除に失敗しました");
    }
  }

  async function handleNoteSave(itemId: number, note: string) {
    await fetch(`/api/cluster-items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    await load();
  }

  const memberClusterIds = new Set(memberships.map((m) => m.cluster.id));
  const availableClusters = allClusters.filter((c) => !memberClusterIds.has(c.id));

  return (
    <section className="mt-8 border border-stone-300 bg-[#faf8f5] p-4">
      <h3 className="text-xs tracking-widest text-stone-500 uppercase">
        Clusters — 消失シグナルの束
      </h3>
      <p className="mt-1 text-sm text-stone-600">
        人間が意味づけたあと、同じ消え方をしている断片を束ねる
      </p>

      {loading ? (
        <p className="mt-4 text-sm text-stone-500">読み込み中…</p>
      ) : (
        <>
          {memberships.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">
              まだClusterに所属していません。
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {memberships.map((m) => (
                <li
                  key={m.itemId}
                  className="border border-stone-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/clusters/${m.cluster.id}`}
                      className="font-serif text-stone-900 underline"
                    >
                      {m.cluster.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(m.itemId)}
                      className="shrink-0 text-xs text-stone-500 hover:text-stone-800"
                    >
                      削除
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-stone-600">
                    {m.cluster.question}
                  </p>
                  <label className="mt-2 block text-xs text-stone-500">
                    このClusterに入れる理由
                    <textarea
                      defaultValue={m.note ?? ""}
                      onBlur={(e) => handleNoteSave(m.itemId, e.target.value)}
                      rows={2}
                      placeholder={CLUSTER_ITEM_NOTE_PLACEHOLDER}
                      className="mt-1 w-full border border-stone-300 px-2 py-1.5 text-sm leading-relaxed"
                    />
                  </label>
                </li>
              ))}
            </ul>
          )}

          {availableClusters.length > 0 && (
            <form onSubmit={handleAdd} className="mt-4 space-y-2 border-t border-stone-200 pt-4">
              <label className="block text-xs text-stone-600">
                Clusterに追加
                <select
                  value={selectedClusterId}
                  onChange={(e) => setSelectedClusterId(e.target.value)}
                  className="mt-1 w-full border border-stone-300 px-2 py-1 text-sm"
                >
                  <option value="">選択してください</option>
                  {availableClusters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-stone-600">
                このClusterに入れる理由（任意）
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={2}
                  placeholder={CLUSTER_ITEM_NOTE_PLACEHOLDER}
                  className="mt-1 w-full border border-stone-300 px-2 py-1.5 text-sm leading-relaxed"
                />
              </label>
              <button
                type="submit"
                disabled={!selectedClusterId}
                className="border border-stone-400 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 disabled:opacity-40"
              >
                追加
              </button>
            </form>
          )}

          {message && <p className="mt-2 text-xs text-stone-600">{message}</p>}
        </>
      )}
    </section>
  );
}
