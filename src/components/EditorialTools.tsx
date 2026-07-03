"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EDITORIAL_ACTIONS } from "@/lib/editorial-types";
import type { EditorialActionType } from "@/lib/editorial-types";
import type { SerializedArticleDraft } from "@/lib/article-types";

export function EditorialTools({
  draftId,
  draft,
}: {
  draftId: number;
  draft: SerializedArticleDraft;
}) {
  const router = useRouter();
  const [running, setRunning] = useState<EditorialActionType | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function runAction(actionType: EditorialActionType) {
    setRunning(actionType);
    setMessage("");
    setError("");

    const res = await fetch(`/api/article-drafts/${draftId}/editorial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionType }),
    });

    setRunning(null);

    if (res.ok) {
      const label =
        EDITORIAL_ACTIONS.find((a) => a.type === actionType)?.label ?? actionType;
      setMessage(`「${label}」を適用しました`);
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "編集ツールの実行に失敗しました");
    }
  }

  const observeActions = EDITORIAL_ACTIONS.filter((a) => a.group === "observe");
  const deepenActions = EDITORIAL_ACTIONS.filter((a) => a.group === "deepen");
  const deriveActions = EDITORIAL_ACTIONS.filter((a) => a.group === "derive");

  return (
    <div className="space-y-6 border border-stone-200 bg-[#faf8f5] p-4">
      <div>
        <h3 className="text-xs tracking-widest text-stone-500 uppercase">
          Editorial Tools
        </h3>
        <p className="mt-1 text-xs text-stone-500">
          生成された下書きを、SHIRO &amp; Co. / book.shiroand.io向けの観測文に整える
        </p>
      </div>

      <ToolGroup
        title="観測文を整える"
        actions={observeActions}
        running={running}
        onRun={runAction}
      />

      <ToolGroup
        title="記事をもう一段深くする"
        actions={[...deepenActions, ...deriveActions]}
        running={running}
        onRun={runAction}
      />

      {(message || error) && (
        <p className={`text-xs ${error ? "text-red-700" : "text-stone-600"}`}>
          {error || message}
        </p>
      )}

      {draft.titleCandidates.length > 0 && (
        <DerivedBlock title="タイトル案">
          <ul className="space-y-2 text-sm">
            {draft.titleCandidates.map((c) => (
              <li key={`${c.type}-${c.title}`}>
                <span className="text-xs text-stone-500">{c.type}</span>
                <p className="font-serif text-stone-900">{c.title}</p>
              </li>
            ))}
          </ul>
        </DerivedBlock>
      )}

      {draft.linkedinPost && (
        <DerivedBlock title="LinkedIn告知文">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
            {draft.linkedinPost}
          </p>
        </DerivedBlock>
      )}

      {draft.noteIntro && (
        <DerivedBlock title="note向け導入文">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
            {draft.noteIntro}
          </p>
        </DerivedBlock>
      )}

      {(draft.revisions?.length ?? 0) > 0 && (
        <DerivedBlock title="編集履歴">
          <ul className="space-y-1 text-xs text-stone-600">
            {draft.revisions!.map((r) => (
              <li key={r.id}>
                {new Date(r.createdAt).toLocaleString("ja-JP")} — {r.actionLabel}
              </li>
            ))}
          </ul>
        </DerivedBlock>
      )}
    </div>
  );
}

function ToolGroup({
  title,
  actions,
  running,
  onRun,
}: {
  title: string;
  actions: typeof EDITORIAL_ACTIONS;
  running: EditorialActionType | null;
  onRun: (type: EditorialActionType) => void;
}) {
  return (
    <div>
      <h4 className="text-xs text-stone-500">{title}</h4>
      <div className="mt-2 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.type}
            type="button"
            disabled={running !== null}
            onClick={() => onRun(action.type)}
            title={action.description}
            className="border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-700 hover:border-stone-500 hover:bg-stone-50 disabled:opacity-40"
          >
            {running === action.type ? "処理中…" : action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DerivedBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-stone-200 pt-4">
      <h4 className="text-xs tracking-widest text-stone-500 uppercase">
        {title}
      </h4>
      <div className="mt-2">{children}</div>
    </div>
  );
}
