import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/Header";
import {
  CurationBadge,
  CurationButtons,
} from "@/components/CurationControls";
import { HumanNoteEditor } from "@/components/HumanNoteEditor";
import { PublicNoteEditor } from "@/components/PublicNoteEditor";
import { PublishStatusSelect } from "@/components/PublishStatusSelect";
import { ClusterMembershipEditor } from "@/components/ClusterMembershipEditor";
import {
  CategoryBadge,
  ProtocolBlock,
  ScoreBreakdown,
  StatusBadge,
} from "@/components/ProtocolDisplay";
import { getVideoById } from "@/lib/stats";

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await getVideoById(id);

  if (!video) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl flex-1 px-4 py-8">
        <Link href="/videos" className="text-xs text-stone-500 underline">
          ← 一覧に戻る
        </Link>

        <div className="mt-4 flex flex-col gap-6 sm:flex-row">
          {video.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnailUrl}
              alt=""
              className="h-40 w-full max-w-xs object-cover bg-stone-100"
            />
          )}
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={video.status} />
              <CurationBadge status={video.curationStatus} />
              {video.analysis && (
                <CategoryBadge category={video.analysis.category} />
              )}
            </div>
            <h2 className="mt-2 font-serif text-2xl text-stone-900">
              {video.title}
            </h2>
            <p className="mt-1 text-sm text-stone-600">{video.channelTitle}</p>
            <p className="mt-2 text-xs text-stone-500">
              {new Date(video.publishedAt).toLocaleString("ja-JP")} ·{" "}
              {video.duration} · views {video.viewCount.toLocaleString()} ·
              likes {video.likeCount.toLocaleString()} · comments{" "}
              {video.commentCount.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Seed: {video.seedKeyword}
            </p>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-stone-700 underline"
            >
              YouTube で開く
            </a>
          </div>
        </div>

        {video.description && (
          <section className="mt-8 border border-stone-200 bg-white p-4">
            <h3 className="text-xs tracking-widest text-stone-500 uppercase">
              YouTube Metadata — Description
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
              {video.description}
            </p>
          </section>
        )}

        {video.analysis ? (
          <section className="mt-8">
            <h3 className="mb-4 font-serif text-xl text-stone-900">
              Kosuke Protocol Analysis
            </h3>
            <div className="space-y-4">
              <ProtocolBlock title="Observe">
                {video.analysis.observe}
              </ProtocolBlock>
              <ProtocolBlock title="Sample">{video.analysis.sample}</ProtocolBlock>
              <ProtocolBlock title="Recombine">
                {video.analysis.recombine}
              </ProtocolBlock>
              <ProtocolBlock title="Question">
                {video.analysis.question}
              </ProtocolBlock>
              <ProtocolBlock title="Field Note">
                <p className="font-serif text-base">
                  {video.analysis.fieldNoteTitle}
                </p>
                <p className="mt-3">{video.analysis.fieldNote}</p>
              </ProtocolBlock>
              {video.analysis.articleAngle && (
                <ProtocolBlock title="Article Angle">
                  <p>{video.analysis.articleAngle}</p>
                  {video.analysis.articleTitleCandidates &&
                    video.analysis.articleTitleCandidates.length > 0 && (
                      <ul className="mt-3 list-inside list-disc space-y-1">
                        {video.analysis.articleTitleCandidates.map(
                          (title: string) => (
                            <li key={title}>{title}</li>
                          )
                        )}
                      </ul>
                    )}
                </ProtocolBlock>
              )}
            </div>
          </section>
        ) : (
          <section className="mt-8 border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
            <p className="text-sm text-stone-600">
              まだ意味づけられていない生活
            </p>
          </section>
        )}

        <HumanNoteEditor videoId={video.id} initialNote={video.humanNote} />

        <PublicNoteEditor videoId={video.id} initialNote={video.publicNote} />

        <section className="mt-6 border border-stone-200 bg-white p-4">
          <h3 className="text-xs tracking-widest text-stone-500 uppercase">
            公開設定
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <PublishStatusSelect
              entityType="video"
              entityId={video.id}
              currentStatus={video.publishStatus}
              label="Source Video 公開ステータス"
            />
            {video.analysis && (
              <PublishStatusSelect
                entityType="analysis"
                entityId={video.analysis.id}
                currentStatus={video.analysis.publishStatus}
                label="Field Note 公開ステータス"
              />
            )}
          </div>
        </section>

        <ClusterMembershipEditor videoId={video.id} />

        <section className="mt-8 border border-stone-200 bg-white p-4">
          <h3 className="text-xs tracking-widest text-stone-500 uppercase">
            選別 — Article / Meaning Layer
          </h3>
          <p className="mt-1 text-sm text-stone-600">
            記事化候補または Meaning Layer 候補として送る
          </p>
          <div className="mt-4">
            <CurationButtons
              videoId={video.id}
              currentStatus={video.curationStatus}
            />
          </div>
        </section>

        {video.analysis && (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="border border-stone-200 bg-white p-4">
              <ScoreBreakdown
                scores={video.analysis.scores}
                total={video.analysis.vanishingLifeScore}
              />
              <p className="mt-4 text-xs text-stone-500">
                model: {video.analysis.model}
              </p>
            </div>
            <ProtocolBlock title="Tags">
              <div className="flex flex-wrap gap-2">
                {video.analysis.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="border border-stone-200 px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </ProtocolBlock>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
