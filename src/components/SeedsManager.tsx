"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Seed {
  id: number;
  keyword: string;
  isActive: boolean;
}

export function SeedsManager({ initialSeeds }: { initialSeeds: Seed[] }) {
  const router = useRouter();
  const [newKeyword, setNewKeyword] = useState("");
  const [message, setMessage] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    const res = await fetch("/api/seeds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: newKeyword.trim() }),
    });
    if (res.ok) {
      setNewKeyword("");
      setMessage("追加しました");
      router.refresh();
    } else {
      const err = await res.json();
      setMessage(err.error ?? "追加に失敗しました");
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/seeds/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleToggle(id: number, isActive: boolean) {
    await fetch(`/api/seeds/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }

  async function handleSearch(keyword: string) {
    setMessage(`「${keyword}」で検索中…`);
    const res = await fetch("/api/youtube/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`完了: ${data.found}件見つかり、${data.saved}件保存`);
    } else {
      setMessage(data.error ?? "検索に失敗しました");
    }
  }

  return (
    <>
      <form onSubmit={handleAdd} className="mt-6 flex gap-2">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="新しいキーワード"
          className="flex-1 border border-stone-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700"
        >
          追加
        </button>
      </form>

      {message && <p className="mt-3 text-sm text-stone-600">{message}</p>}

      <div className="mt-8 space-y-2">
        {initialSeeds.map((seed) => (
          <div
            key={seed.id}
            className="flex flex-col gap-2 border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span
                className={`h-2 w-2 rounded-full ${
                  seed.isActive ? "bg-stone-700" : "bg-stone-300"
                }`}
              />
              <span
                className={`text-sm ${
                  seed.isActive
                    ? "text-stone-900"
                    : "text-stone-400 line-through"
                }`}
              >
                {seed.keyword}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSearch(seed.keyword)}
                className="border border-stone-400 px-3 py-1 text-xs text-stone-700 hover:bg-stone-50"
              >
                このKeywordで検索
              </button>
              <button
                type="button"
                onClick={() => handleToggle(seed.id, seed.isActive)}
                className="border border-stone-300 px-3 py-1 text-xs text-stone-600"
              >
                {seed.isActive ? "無効化" : "有効化"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(seed.id)}
                className="px-3 py-1 text-xs text-red-700 hover:underline"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
