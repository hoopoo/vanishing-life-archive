"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PUBLISH_STATUSES,
  PUBLISH_STATUS_LABELS,
  type PublishStatus,
} from "@/lib/constants";

export function PublishStatusSelect({
  entityType,
  entityId,
  currentStatus,
  label = "公開ステータス",
}: {
  entityType: "video" | "analysis" | "articleDraft" | "cluster";
  entityId: number;
  currentStatus: string;
  label?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const endpoints: Record<string, string> = {
    video: `/api/videos/${entityId}/publish`,
    analysis: `/api/analysis/${entityId}/publish`,
    articleDraft: `/api/article-drafts/${entityId}/publish`,
    cluster: `/api/clusters/${entityId}/publish`,
  };

  async function handleChange(next: PublishStatus) {
    setSaving(true);
    setStatus(next);

    const res = await fetch(endpoints[entityType], {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publishStatus: next }),
    });

    setSaving(false);
    if (res.ok) router.refresh();
    else setStatus(currentStatus);
  }

  return (
    <label className="block text-xs text-stone-600">
      {label}
      <select
        value={status}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value as PublishStatus)}
        className="mt-1 w-full max-w-xs border border-stone-300 px-2 py-1.5 text-sm disabled:opacity-50"
      >
        {PUBLISH_STATUSES.map((s) => (
          <option key={s} value={s}>
            {PUBLISH_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </label>
  );
}
