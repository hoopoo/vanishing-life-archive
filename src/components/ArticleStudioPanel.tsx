"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ArticleCandidateVideo } from "@/lib/article-types";
import type { SerializedCluster } from "@/lib/cluster-types";

type SourceMode = "candidates" | "cluster";

export function ArticleStudioPanel({
  candidates,
  clusters,
  initialClusterId,
}: {
  candidates: ArticleCandidateVideo[];
  clusters: SerializedCluster[];
  initialClusterId?: number;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<SourceMode>(
    initialClusterId ? "cluster" : "candidates"
  );
  const [selectedClusterId, setSelectedClusterId] = useState(
    initialClusterId ? String(initialClusterId) : ""
  );
  const [clusterVideos, setClusterVideos] = useState<ArticleCandidateVideo[]>([]);
  const [loadingCluster, setLoadingCluster] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const activeList = mode === "cluster" ? clusterVideos : candidates;

  const loadClusterVideos = useCallback(async (clusterId: string) => {
    if (!clusterId) {
      setClusterVideos([]);
      return;
    }
    setLoadingCluster(true);
    const res = await fetch(`/api/clusters/${clusterId}/videos`);
    if (res.ok) {
      const videos = (await res.json()) as ArticleCandidateVideo[];
      setClusterVideos(videos);
      setSelected(new Set(videos.map((v) => v.id)));
    } else {
      setClusterVideos([]);
      setSelected(new Set());
    }
    setLoadingCluster(false);
  }, []);

  useEffect(() => {
    if (mode === "cluster" && selectedClusterId) {
      void loadClusterVideos(selectedClusterId);
    }
  }, [mode, selectedClusterId, loadClusterVideos]);

  useEffect(() => {
    if (initialClusterId) {
      setMode("cluster");
      setSelectedClusterId(String(initialClusterId));
    }
  }, [initialClusterId]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === activeList.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(activeList.map((c) => c.id)));
    }
  }

  async function handleGenerate() {
    if (selected.size === 0) {
      setMessage("1件以上選択してください");
      return;
    }

    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      const res = await fetch("/api/article-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成に失敗しました");

      setResult(JSON.stringify(data.result, null, 2));
      setMessage(`記事案を生成しました（Draft #${data.draft.id}）`);
      router.refresh();
      router.push(`/article-studio/${data.draft.id}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function handleModeChange(next: SourceMode) {
    setMode(next);
    setSelected(new Set());
    setMessage("");
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-4">
        <button
          type="button"
          onClick={() => handleModeChange("candidates")}
          className={`px-3 py-1.5 text-xs ${
            mode === "candidates"
              ? "border border-stone-800 bg-stone-900 text-white"
              : "border border-stone-300 text-stone-700 hover:bg-stone-50"
          }`}
        >
          Article Candidateから選択
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("cluster")}
          className={`px-3 py-1.5 text-xs ${
            mode === "cluster"
              ? "border border-stone-800 bg-stone-900 text-white"
              : "border border-stone-300 text-stone-700 hover:bg-stone-50"
          }`}
        >
          Clusterからまとめて選択
        </button>
      </div>

      {mode === "cluster" && (
        <div className="mt-4">
          <label className="block text-xs text-stone-600">
            消失シグナルの束
            <select
              value={selectedClusterId}
              onChange={(e) => {
                setSelectedClusterId(e.target.value);
                setSelected(new Set());
              }}
              className="mt-1 w-full max-w-md border border-stone-300 px-2 py-1.5 text-sm"
            >
              <option value="">Clusterを選択</option>
              {clusters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} (
                  {c.itemCount > 0
                    ? `${c.itemCount}件`
                    : c.candidateCount > 0
                      ? `${c.candidateCount}件候補`
                      : "0件"}
                  )
                </option>
              ))}
            </select>
          </label>
          {selectedClusterId && (
            <p className="mt-2 text-xs text-stone-500">
              {clusters.find((c) => String(c.id) === selectedClusterId)?.question}
            </p>
          )}
        </div>
      )}

      {mode === "candidates" && candidates.length === 0 ? (
        <p className="mt-8 text-sm text-stone-500">
          記事化候補がありません。Videos ページで Article
          ボタンを押して選別してください。
        </p>
      ) : mode === "cluster" && !selectedClusterId ? (
        <p className="mt-8 text-sm text-stone-500">
          Clusterを選択すると、所属動画をまとめて記事案に使えます。
        </p>
      ) : loadingCluster ? (
        <p className="mt-8 text-sm text-stone-500">読み込み中…</p>
      ) : activeList.length === 0 ? (
        <p className="mt-8 text-sm text-stone-500">
          {mode === "cluster"
            ? "この Cluster に一致する生活断片がありません。"
            : "選択できる動画がありません。"}
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <p className="text-sm text-stone-600">
              {selected.size} / {activeList.length} 件選択中
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleAll}
                className="border border-stone-300 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50"
              >
                {selected.size === activeList.length ? "選択解除" : "すべて選択"}
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || selected.size === 0}
                className="border border-stone-800 bg-stone-900 px-4 py-1.5 text-sm text-white hover:bg-stone-700 disabled:bg-stone-400"
              >
                {loading ? "生成中…" : "記事案を生成"}
              </button>
            </div>
          </div>

          {message && <p className="mt-3 text-sm text-stone-600">{message}</p>}

          <div className="mt-4 space-y-2">
            {activeList.map((video) => (
              <label
                key={video.id}
                className={`flex cursor-pointer gap-4 border p-4 transition ${
                  selected.has(video.id)
                    ? "border-stone-500 bg-stone-50"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(video.id)}
                  onChange={() => toggle(video.id)}
                  className="mt-1 shrink-0"
                />
                {video.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnailUrl}
                    alt=""
                    className="h-14 w-24 shrink-0 bg-stone-100 object-cover"
                  />
                ) : (
                  <div className="h-14 w-24 shrink-0 bg-stone-100" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-stone-900">{video.fieldNoteTitle}</p>
                  <p className="mt-0.5 truncate text-xs text-stone-400">
                    Source · {video.title}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-stone-600">
                    <span>{video.category}</span>
                    <span className="font-mono">score {video.vanishingLifeScore}</span>
                  </div>
                  {video.articleAngle && (
                    <p className="mt-1 line-clamp-1 text-xs text-stone-500">
                      {video.articleAngle}
                    </p>
                  )}
                  {video.humanNotePreview && (
                    <p className="mt-1 line-clamp-2 text-xs text-stone-500 italic">
                      {video.humanNotePreview}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>

          {result && (
            <pre className="mt-6 max-h-96 overflow-auto border border-stone-200 bg-stone-50 p-4 text-xs text-stone-700">
              {result}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
