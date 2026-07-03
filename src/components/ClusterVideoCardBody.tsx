import Link from "next/link";
import { CategoryBadge } from "@/components/ProtocolDisplay";
import type { SerializedClusterVideo } from "@/lib/cluster-types";

export function ClusterVideoCardBody({
  video,
  showTags = true,
}: {
  video: SerializedClusterVideo;
  showTags?: boolean;
}) {
  const heading = video.fieldNoteTitle?.trim() || video.sourceTitle;

  return (
    <>
      <div className="flex gap-4">
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
          <Link
            href={`/videos/${video.id}`}
            className="font-serif leading-snug text-stone-900 underline-offset-2 hover:underline"
          >
            {heading}
          </Link>
          {video.fieldNoteTitle && (
            <p className="mt-1 truncate text-[11px] text-stone-400">
              Source · {video.sourceTitle}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-600">
            <CategoryBadge category={video.category} />
            <span className="font-mono">{video.vanishingLifeScore}</span>
            {video.seedKeyword && (
              <span className="text-stone-500">seed: {video.seedKeyword}</span>
            )}
          </div>
          {video.humanNoteExcerpt && (
            <p className="mt-2 line-clamp-2 text-xs text-stone-600 italic">
              {video.humanNoteExcerpt}
            </p>
          )}
          {showTags && video.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {video.tags.slice(0, 6).map((tag) => (
                <span
                  key={tag}
                  className="border border-stone-200 px-1.5 py-0.5 text-[10px] text-stone-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
