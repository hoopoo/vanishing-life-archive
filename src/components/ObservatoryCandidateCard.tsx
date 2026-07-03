import Link from "next/link";
import { CategoryBadge } from "@/components/ProtocolDisplay";
import {
  getObservatoryCardDisplay,
  type ObservatoryCardInput,
} from "@/lib/observatory-display";

export function ObservatoryCandidateCard({
  id,
  category,
  vanishingLifeScore,
  ...input
}: ObservatoryCardInput & {
  id: number;
  category: string;
  vanishingLifeScore: number;
}) {
  const display = getObservatoryCardDisplay(input);

  return (
    <Link
      href={`/videos/${id}`}
      className="block border border-stone-200 bg-white p-4 transition hover:border-stone-400"
    >
      <p className="font-serif leading-snug text-stone-900">{display.heading}</p>
      {display.subline && (
        <p className="mt-1 text-sm text-stone-700">{display.subline}</p>
      )}
      {display.humanNoteExcerpt && (
        <p className="mt-2 line-clamp-2 text-xs text-stone-600 italic">
          {display.humanNoteExcerpt}
        </p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <CategoryBadge category={category} />
        <span className="font-mono text-xs text-stone-600">
          {vanishingLifeScore}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-stone-400">
        Source · {display.sourceTitle}
      </p>
    </Link>
  );
}
