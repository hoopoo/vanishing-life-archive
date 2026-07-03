"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CURATION_STATUS_LABELS,
  type CurationStatus,
} from "@/lib/constants";

const CURATION_ACTIONS: {
  status: CurationStatus;
  label: string;
}[] = [
  { status: "keep", label: "Keep" },
  { status: "ignore", label: "Ignore" },
  { status: "later", label: "Later" },
  { status: "article_candidate", label: "Article" },
  { status: "meaning_layer_candidate", label: "Meaning Layer" },
];

export function CurationBadge({ status }: { status: string }) {
  const label =
    CURATION_STATUS_LABELS[status as CurationStatus] ?? status;
  return (
    <span className="inline-block border border-stone-300 px-2 py-0.5 text-xs text-stone-600">
      {label}
    </span>
  );
}

export function CurationButtons({
  videoId,
  currentStatus,
}: {
  videoId: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setStatus(status: CurationStatus) {
    setLoading(status);
    await fetch(`/api/videos/${videoId}/curation`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ curationStatus: status }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-1">
      {CURATION_ACTIONS.map(({ status, label }) => (
        <button
          key={status}
          type="button"
          onClick={() => setStatus(status)}
          disabled={loading === status}
          className={`border px-2 py-0.5 text-xs transition ${
            currentStatus === status
              ? "border-stone-700 bg-stone-100 text-stone-900"
              : "border-stone-300 text-stone-600 hover:border-stone-500"
          }`}
        >
          {loading === status ? "…" : label}
        </button>
      ))}
    </div>
  );
}
