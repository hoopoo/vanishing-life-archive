"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HumanNoteEditor({
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

    const res = await fetch(`/api/videos/${videoId}/note`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ humanNote: note }),
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
    <section className="mt-8 border border-stone-300 bg-[#faf8f5] p-4">
      <h3 className="text-xs tracking-widest text-stone-500 uppercase">
        Human Note — 内部観測メモ
      </h3>
      <p className="mt-1 text-sm text-stone-600">
        内部用。Public Export には含まれません。
      </p>
      <form onSubmit={handleSave} className="mt-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={6}
          placeholder="この生活断片について、観測者としてメモを残す…"
          className="w-full border border-stone-300 bg-white px-3 py-2 text-sm leading-relaxed text-stone-800"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="border border-stone-700 px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-100 disabled:opacity-50"
          >
            {saving ? "保存中…" : "保存"}
          </button>
          {message && (
            <span className="text-xs text-stone-600">{message}</span>
          )}
        </div>
      </form>
    </section>
  );
}
