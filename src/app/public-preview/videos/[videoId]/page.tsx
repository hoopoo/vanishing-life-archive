import Link from "next/link";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/Header";
import { getPublicPreviewData } from "@/lib/public-export";

interface PageProps {
  params: Promise<{ videoId: string }>;
}

export default async function PublicVideoDetailPage({ params }: PageProps) {
  const { videoId } = await params;
  const bundle = await getPublicPreviewData();
  const video = bundle.videos.find((v) => v.id === videoId);
  if (!video) notFound();

  const fieldNote = bundle.fieldNotes.find((fn) =>
    fn.sourceVideoIds.includes(video.id)
  );
  const meaningLayer = bundle.meaningLayer.find((ml) =>
    ml.sourceVideoIds.includes(video.id)
  );

  return (
    <>
      <Header mode="public" />
      <main className="mx-auto max-w-4xl flex-1 px-4 py-8">
        <Link
          href="/public-preview/videos"
          className="text-xs text-stone-500 underline"
        >
          ← Videos
        </Link>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row">
          {video.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnailUrl}
              alt=""
              className="h-40 w-full max-w-xs shrink-0 object-cover bg-stone-100"
            />
          )}
          <div>
            <p className="text-xs text-stone-500">{video.category}</p>
            <h2 className="mt-1 font-serif text-2xl text-stone-900">
              {video.displayTitle}
            </h2>
            {video.displayTitle !== video.title && (
              <p className="mt-2 text-sm text-stone-500">
                Source · {video.title}
              </p>
            )}
            <p className="mt-3 text-sm text-stone-600">
              {video.channelTitle} ·{" "}
              {new Date(video.publishedAt).toLocaleDateString("ja-JP")} · seed:{" "}
              {video.seedKeyword}
            </p>
            {video.vanishingLifeScore > 0 && (
              <p className="mt-1 font-mono text-sm text-stone-600">
                Vanishing Life Score: {video.vanishingLifeScore}
              </p>
            )}
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-stone-700 underline"
            >
              YouTube で見る →
            </a>
          </div>
        </div>

        {video.publicNote && (
          <section className="mt-8 border border-stone-200 bg-white p-5">
            <h3 className="text-xs tracking-wide text-stone-500 uppercase">
              Public Note
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
              {video.publicNote}
            </p>
          </section>
        )}

        {fieldNote && (
          <section className="mt-8 border border-stone-200 bg-white p-5">
            <h3 className="font-serif text-lg text-stone-900">Field Note</h3>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
              {fieldNote.body}
            </p>
            <p className="mt-4 text-sm italic text-stone-700">
              {fieldNote.question}
            </p>
          </section>
        )}

        {meaningLayer && (
          <section className="mt-8 border border-stone-200 bg-white p-5">
            <h3 className="font-serif text-lg text-stone-900">Meaning Layer</h3>
            <div className="mt-4 space-y-4 text-sm text-stone-800">
              {meaningLayer.observe && (
                <div>
                  <p className="text-xs uppercase text-stone-500">Observe</p>
                  <p className="mt-1 whitespace-pre-wrap">{meaningLayer.observe}</p>
                </div>
              )}
              {meaningLayer.sample && (
                <div>
                  <p className="text-xs uppercase text-stone-500">Sample</p>
                  <p className="mt-1 whitespace-pre-wrap">{meaningLayer.sample}</p>
                </div>
              )}
              {meaningLayer.recombine && (
                <div>
                  <p className="text-xs uppercase text-stone-500">Recombine</p>
                  <p className="mt-1 whitespace-pre-wrap">
                    {meaningLayer.recombine}
                  </p>
                </div>
              )}
            </div>
            {meaningLayer.question && (
              <p className="mt-4 text-sm italic text-stone-700">
                {meaningLayer.question}
              </p>
            )}
          </section>
        )}

        {video.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {video.tags.map((tag) => (
              <span
                key={tag}
                className="border border-stone-200 px-2 py-0.5 text-xs text-stone-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </main>
      <Footer mode="public" />
    </>
  );
}
