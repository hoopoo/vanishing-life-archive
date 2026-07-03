"use client";

import { useState } from "react";

export function RunActionWithResult({
  label,
  description,
  action,
  variant = "primary",
}: {
  label: string;
  description: string;
  action: () => Promise<unknown>;
  variant?: "primary" | "secondary";
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await action();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-stone-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-serif text-lg text-stone-900">{label}</h3>
          <p className="mt-1 text-sm text-stone-600">{description}</p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className={`shrink-0 px-4 py-2 text-sm transition ${
            variant === "primary"
              ? "bg-stone-900 text-white hover:bg-stone-700 disabled:bg-stone-400"
              : "border border-stone-400 text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          }`}
        >
          {loading ? "実行中…" : "観測する"}
        </button>
      </div>
      {result && (
        <pre className="mt-4 max-h-96 overflow-auto bg-stone-50 p-3 text-xs text-stone-700">
          {result}
        </pre>
      )}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
