import Link from "next/link";
import type { PublicVideo } from "@/lib/publish-types";

const ROLE_LABELS: Record<PublicVideo["curationRole"], string> = {
  field_note: "Field Note",
  meaning_layer: "Meaning Layer",
  reference: "Source",
};

export function PublicVideoListItem({ video }: { video: PublicVideo }) {
  return (
    <article className="flex gap-4 border border-stone-200 bg-white p-4">
      {video.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.thumbnailUrl}
          alt=""
          className="h-16 w-28 shrink-0 bg-stone-100 object-cover"
        />
      ) : (
        <div className="h-16 w-28 shrink-0 bg-stone-100" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="border border-stone-300 px-2 py-0.5 text-xs text-stone-600">
            {ROLE_LABELS[video.curationRole]}
          </span>
          {video.category !== "—" && (
            <span className="border border-stone-200 px-2 py-0.5 text-xs text-stone-600">
              {video.category}
            </span>
          )}
          {video.vanishingLifeScore > 0 && (
            <span className="font-mono text-xs text-stone-600">
              score: {video.vanishingLifeScore}
            </span>
          )}
        </div>
        <h3 className="mt-1 font-serif text-stone-900">{video.displayTitle}</h3>
        {video.displayTitle !== video.title && (
          <p className="mt-0.5 text-xs text-stone-500">Source · {video.title}</p>
        )}
        {video.publicNote && (
          <p className="mt-2 line-clamp-2 text-sm text-stone-600">
            {video.publicNote}
          </p>
        )}
        <p className="mt-2 text-xs text-stone-500">
          {video.channelTitle} ·{" "}
          {new Date(video.publishedAt).toLocaleDateString("ja-JP")} · seed:{" "}
          {video.seedKeyword}
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-600 underline"
          >
            YouTube
          </a>
          <Link
            href={`/public-preview/videos/${video.id}`}
            className="text-stone-900 underline"
          >
            詳細
          </Link>
          {video.fieldNoteSlug && (
            <Link
              href={`/public-preview/field-notes#${video.fieldNoteSlug}`}
              className="text-stone-600 underline"
            >
              Field Note
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
