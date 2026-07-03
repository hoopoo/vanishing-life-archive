import Link from "next/link";
import { Header, Footer } from "@/components/Header";
import { PublicVideoListItem } from "@/components/PublicVideoListItem";
import { getPublicPreviewData } from "@/lib/public-export";
import { CATEGORIES } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function PublicVideosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const bundle = await getPublicPreviewData();
  const category = params.category ?? "";

  const videos = category
    ? bundle.videos.filter((v) => v.category === category)
    : bundle.videos;

  return (
    <>
      <Header mode="public" />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
        <Link href="/public-preview" className="text-xs text-stone-500 underline">
          ← Public Preview
        </Link>
        <h2 className="mt-4 font-serif text-2xl text-stone-900">Videos</h2>
        <p className="mt-1 text-sm text-stone-600">
          公開対象の生活断片 — Human Note や内部メモは含まれません
        </p>

        <form className="mt-6 flex flex-wrap items-end gap-3">
          <label className="block text-xs text-stone-600">
            カテゴリ
            <select
              name="category"
              defaultValue={category}
              className="mt-1 block border border-stone-300 px-2 py-1.5 text-sm"
            >
              <option value="">すべて</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="border border-stone-800 px-3 py-1.5 text-sm text-stone-900 hover:bg-stone-50"
          >
            フィルター
          </button>
        </form>

        <p className="mt-4 text-sm text-stone-600">{videos.length} 件</p>

        {videos.length === 0 ? (
          <p className="mt-8 text-sm text-stone-500">
            公開対象の動画がありません。Video Detail で publishStatus を
            public_ready に設定してください。
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {videos.map((video) => (
              <PublicVideoListItem key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>
      <Footer mode="public" />
    </>
  );
}
