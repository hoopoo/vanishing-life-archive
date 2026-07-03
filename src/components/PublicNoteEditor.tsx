"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PublicNoteEditor({
  videoId,
  initialNote,
}: {
  videoId: number;
  initialNote: string | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch(`/api/videos/${videoId}/public-note`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicNote: note }),
    });

    setSaving(false);
    if (res.ok) {
      setMessage("保存しました");
      router.refresh();
    } else {
      setMessage("保存に失敗しました");
    }
  }

  return (
    <section className="mt-8 border border-stone-200 bg-white p-4">
      <h3 className="text-xs tracking-widest text-stone-500 uppercase">
        Public Note — 公開用メモ
      </h3>
      <p className="mt-1 text-sm text-stone-600">
        外部公開してよい文章。Human Note はそのまま出しません。
      </p>
      <form onSubmit={handleSave} className="mt-4 space-y-3">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          placeholder="Public版に載せる観測メモを書く…"
          className="w-full border border-stone-300 px-3 py-2 text-sm leading-relaxed"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="border border-stone-700 px-4 py-2 text-sm text-stone-800 hover:bg-stone-50 disabled:opacity-50"
          >
            {saving ? "保存中…" : "Public Note を保存"}
          </button>
          {message && <span className="text-xs text-stone-600">{message}</span>}
        </div>
      </form>
    </section>
  );
}
