"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SerializedArticleDraft } from "@/lib/article-types";
import { EditorialTools } from "@/components/EditorialTools";
import { PublishStatusSelect } from "@/components/PublishStatusSelect";

export function ArticleDraftEditor({
  draft,
}: {
  draft: SerializedArticleDraft;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: draft.title,
    subtitle: draft.subtitle,
    theme: draft.theme,
    angle: draft.angle,
    lead: draft.lead,
    bodyDraft: draft.bodyDraft,
    status: draft.status,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch(`/api/article-drafts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (res.ok) {
      setMessage("保存しました");
      router.refresh();
    } else {
      setMessage("保存に失敗しました");
    }
  }

  function handleExport() {
    window.location.href = `/api/article-drafts/${draft.id}/export`;
  }

  return (
    <div className="mt-8 space-y-8">
      <form onSubmit={handleSave} className="space-y-4 border border-stone-200 bg-white p-4">
        <h3 className="font-serif text-lg text-stone-900">編集</h3>

        {(
          [
            ["title", "タイトル", "text"],
            ["subtitle", "サブタイトル", "text"],
            ["theme", "テーマ", "text"],
            ["angle", "切り口", "text"],
            ["lead", "リード", "textarea"],
            ["bodyDraft", "本文下書き", "textarea-large"],
            ["status", "ステータス", "select"],
          ] as const
        ).map(([key, label, type]) => (
          <label key={key} className="block text-sm text-stone-700">
            {label}
            {type === "select" ? (
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
                className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="draft">draft</option>
                <option value="selected">selected</option>
                <option value="exported">exported</option>
              </select>
            ) : type === "textarea-large" ? (
              <textarea
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
                rows={16}
                className="mt-1 w-full border border-stone-300 px-3 py-2 font-mono text-sm leading-relaxed"
              />
            ) : type === "textarea" ? (
              <textarea
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
                rows={4}
                className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm leading-relaxed"
              />
            ) : (
              <input
                type="text"
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
                className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm"
              />
            )}
          </label>
        ))}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="border border-stone-800 px-4 py-2 text-sm text-stone-900 hover:bg-stone-50 disabled:opacity-50"
          >
            {saving ? "保存中…" : "保存"}
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="border border-stone-400 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            Markdown Export
          </button>
        </div>
        {message && <p className="text-xs text-stone-600">{message}</p>}
      </form>

      <section className="mt-6 border border-stone-200 bg-white p-4">
        <PublishStatusSelect
          entityType="articleDraft"
          entityId={draft.id}
          currentStatus={draft.publishStatus}
          label="Article Draft 公開ステータス"
        />
      </section>

      <EditorialTools draftId={draft.id} draft={draft} />

      <section className="border border-stone-200 bg-[#faf8f5] p-4">
        <h3 className="text-xs tracking-widest text-stone-500 uppercase">
          Outline
        </h3>
        <div className="mt-3 space-y-3">
          {draft.outline.map((item) => (
            <div key={item.heading}>
              <p className="font-serif text-stone-900">{item.heading}</p>
              <p className="mt-1 text-sm text-stone-600">{item.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-stone-200 bg-white p-4">
        <h3 className="text-xs tracking-widest text-stone-500 uppercase">
          Questions
        </h3>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-stone-700">
          {draft.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </section>

      <section className="border border-stone-200 bg-white p-4">
        <h3 className="text-xs tracking-widest text-stone-500 uppercase">
          Source Videos
        </h3>
        <ul className="mt-3 space-y-2 text-sm">
          {(draft.selectedVideos ?? []).map((v) => (
            <li key={v.id}>
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-700 underline"
              >
                {v.title}
              </a>
              <span className="text-stone-500"> — {v.channelTitle}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-stone-200 bg-white p-4">
        <h3 className="text-xs tracking-widest text-stone-500 uppercase">
          Tags
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {draft.tags.map((tag) => (
            <span
              key={tag}
              className="border border-stone-200 px-2 py-0.5 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
