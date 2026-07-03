"use client";

import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/Header";
import { EnvSettings } from "@/components/EnvSettings";
import { RunActionWithResult } from "@/components/RunActions";

export default function RunPage() {
  const [apiStatus, setApiStatus] = useState<{
    youtube: boolean;
    openai: boolean;
  } | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setApiStatus(d.apiStatus));
  }, []);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl flex-1 px-4 py-8">
        <h2 className="font-serif text-2xl text-stone-900">Run Observation</h2>
        <p className="mt-1 text-sm text-stone-600">
          YouTube から生活の断片を観測し、Kosuke Protocol で解釈する
        </p>

        {apiStatus && (
          <div className="mt-4 flex gap-4 text-xs text-stone-600">
            <span>
              YouTube API:{" "}
              {apiStatus.youtube ? "設定済み" : "未設定（mock使用可）"}
            </span>
            <span>
              OpenAI API:{" "}
              {apiStatus.openai ? "設定済み" : "未設定（mock使用可）"}
            </span>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <EnvSettings />

          <RunActionWithResult
            label="Mock data でテスト実行"
            description="API キーなしで動作確認。6件のサンプル動画と Field Note を投入します。"
            action={async () => {
              const res = await fetch("/api/mock/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ includeAnalysis: true }),
              });
              if (!res.ok) throw new Error("Mock import failed");
              return res.json();
            }}
          />

          <RunActionWithResult
            label="全 Seed Keyword で YouTube 検索"
            description="有効な Seed Keyword ごとに最大10件ずつ動画を検索・保存します。YOUTUBE_API_KEY が必要です。"
            variant="secondary"
            action={async () => {
              const res = await fetch("/api/youtube/search-all", {
                method: "POST",
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error ?? "Search failed");
              return data;
            }}
          />

          <RunActionWithResult
            label="未分析動画を LLM 分析"
            description="Field Note が未作成の動画を Kosuke Protocol で分析します。OPENAI_API_KEY がなければ mock 分析を使用します。"
            variant="secondary"
            action={async () => {
              const res = await fetch("/api/analyze-unprocessed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ useMock: !apiStatus?.openai }),
              });
              if (!res.ok) throw new Error("Analysis failed");
              return res.json();
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
