import Link from "next/link";
import { CategoryBadge } from "@/components/ProtocolDisplay";

export function PublicObservatoryCandidateCard({
  videoId,
  heading,
  subline,
  publicNoteExcerpt,
  sourceTitle,
  category,
  vanishingLifeScore,
}: {
  videoId: string;
  heading: string;
  subline: string | null;
  publicNoteExcerpt: string | null;
  sourceTitle: string;
  category: string;
  vanishingLifeScore: number;
}) {
  return (
    <Link
      href={`/public-preview/videos/${videoId}`}
      className="block border border-stone-200 bg-white p-4 transition hover:border-stone-400"
    >
      <p className="font-serif leading-snug text-stone-900">{heading}</p>
      {subline && (
        <p className="mt-1 text-sm text-stone-700">{subline}</p>
      )}
      {publicNoteExcerpt && (
        <p className="mt-2 line-clamp-2 text-xs text-stone-600">
          {publicNoteExcerpt}
        </p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <CategoryBadge category={category} />
        {vanishingLifeScore > 0 && (
          <span className="font-mono text-xs text-stone-600">
            {vanishingLifeScore}
          </span>
        )}
      </div>
      <p className="mt-2 text-[11px] text-stone-400">
        Source · {sourceTitle}
      </p>
    </Link>
  );
}
