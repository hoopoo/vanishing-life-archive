"use client";

import { useEffect, useState } from "react";

export function EnvSettings() {
  const [youtubeKey, setYoutubeKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [status, setStatus] = useState<{
    youtubeConfigured: boolean;
    openaiConfigured: boolean;
    youtubeMasked: string;
    openaiMasked: string;
    path: string;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/env")
      .then((r) => r.json())
      .then(setStatus);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/settings/env", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        youtubeApiKey: youtubeKey,
        openaiApiKey: openaiKey,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      setMessage(data.message);
      setYoutubeKey("");
      setOpenaiKey("");
      const refreshed = await fetch("/api/settings/env").then((r) => r.json());
      setStatus(refreshed);
    } else {
      setMessage("保存に失敗しました");
    }
  }

  return (
    <section className="border border-stone-300 bg-white p-4">
      <h3 className="font-serif text-lg text-stone-900">API キー設定</h3>
      <p className="mt-1 text-sm text-stone-600">
        ここに貼り付けて保存すると <code className="text-xs">.env.local</code>{" "}
        に書き込まれます。Finder やファイル検索は不要です。
      </p>

      {status && (
        <div className="mt-3 space-y-1 text-xs text-stone-500">
          <p>
            YouTube:{" "}
            {status.youtubeConfigured
              ? `設定済み (${status.youtubeMasked})`
              : "未設定"}
          </p>
          <p>
            OpenAI:{" "}
            {status.openaiConfigured
              ? `設定済み (${status.openaiMasked})`
              : "未設定"}
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="mt-4 space-y-4">
        <label className="block text-sm text-stone-700">
          YouTube API キー
          <input
            type="text"
            value={youtubeKey}
            onChange={(e) => setYoutubeKey(e.target.value)}
            placeholder="AIzaSy..."
            className="mt-1 w-full border border-stone-300 px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="block text-sm text-stone-700">
          OpenAI API キー（任意）
          <input
            type="text"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
            className="mt-1 w-full border border-stone-300 px-3 py-2 font-mono text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700 disabled:bg-stone-400"
        >
          {saving ? "保存中…" : "保存する"}
        </button>
      </form>

      {message && (
        <p className="mt-3 text-sm text-stone-700">{message}</p>
      )}

      <p className="mt-4 text-xs text-stone-500">
        保存後、ターミナルで <code>npm run dev</code>{" "}
        を一度止めて再起動してください。
      </p>
    </section>
  );
}
