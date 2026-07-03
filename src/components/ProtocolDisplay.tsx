import { SCORE_LABELS } from "@/lib/constants";
import type { AnalysisScores } from "@/lib/types";

interface ScoreBreakdownProps {
  scores: AnalysisScores;
  total: number;
}

export function ScoreBreakdown({ scores, total }: ScoreBreakdownProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between border-b border-stone-200 pb-2">
        <span className="text-sm text-stone-600">Vanishing Life Score</span>
        <span className="font-serif text-2xl text-stone-900">{total}</span>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        {Object.entries(scores).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <dt className="text-stone-600">{SCORE_LABELS[key] ?? key}</dt>
            <dd className="font-mono text-stone-900">{value}/5</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

interface ProtocolBlockProps {
  title: string;
  children: React.ReactNode;
}

export function ProtocolBlock({ title, children }: ProtocolBlockProps) {
  return (
    <section className="border border-stone-200 bg-white p-4">
      <h3 className="mb-2 text-xs tracking-widest text-stone-500 uppercase">
        {title}
      </h3>
      <div className="text-sm leading-relaxed text-stone-800">{children}</div>
    </section>
  );
}

export function StatusBadge({
  status,
}: {
  status: "analyzed" | "unanalyzed";
}) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs ${
        status === "analyzed"
          ? "bg-stone-200 text-stone-700"
          : "border border-dashed border-stone-400 text-stone-500"
      }`}
    >
      {status === "analyzed" ? "analyzed" : "unanalyzed"}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-block bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
      {category}
    </span>
  );
}
