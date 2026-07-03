import Link from "next/link";
import {
  CategoryBadge,
  StatusBadge,
} from "@/components/ProtocolDisplay";
import {
  CurationBadge,
  CurationButtons,
} from "@/components/CurationControls";
import type { SerializedVideo } from "@/lib/types";

export function VideoListItem({ video }: { video: SerializedVideo }) {
  return (
    <article className="flex gap-4 border border-stone-200 bg-white p-4">
      {video.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.thumbnailUrl}
          alt=""
          className="h-16 w-28 shrink-0 object-cover bg-stone-100"
        />
      ) : (
        <div className="h-16 w-28 shrink-0 bg-stone-100" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={video.status} />
          <CurationBadge status={video.curationStatus} />
          {video.isFeatured && (
            <span className="text-xs text-stone-500">featured</span>
          )}
          {video.analysis && (
            <>
              <CategoryBadge category={video.analysis.category} />
              <span className="font-mono text-xs text-stone-600">
                score: {video.analysis.vanishingLifeScore}
              </span>
            </>
          )}
        </div>
        <h3 className="mt-1 truncate font-serif text-stone-900">
          {video.title}
        </h3>
        <p className="text-xs text-stone-500">
          {video.channelTitle} ·{" "}
          {new Date(video.publishedAt).toLocaleDateString("ja-JP")} · seed:{" "}
          {video.seedKeyword} · views: {video.viewCount.toLocaleString()}
        </p>
        {video.humanNote && (
          <p className="mt-1 line-clamp-2 text-xs text-stone-600 italic">
            memo: {video.humanNote}
          </p>
        )}
        <div className="mt-2 flex gap-3 text-xs">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-600 underline"
          >
            YouTube
          </a>
          <Link
            href={`/videos/${video.id}`}
            className="text-stone-900 underline"
          >
            詳細
          </Link>
        </div>
        <div className="mt-3 border-t border-stone-100 pt-3">
          <CurationButtons
            videoId={video.id}
            currentStatus={video.curationStatus}
          />
        </div>
      </div>
    </article>
  );
}
