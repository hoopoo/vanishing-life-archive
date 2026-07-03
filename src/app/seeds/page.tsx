import { Header, Footer } from "@/components/Header";
import { SeedsManager } from "@/components/SeedsManager";
import { getSeedKeywords } from "@/lib/stats";

export default async function SeedsPage() {
  const seeds = await getSeedKeywords();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl flex-1 px-4 py-8">
        <h2 className="font-serif text-2xl text-stone-900">Seed Keywords</h2>
        <p className="mt-1 text-sm text-stone-600">
          消失シグナル — 観測用キーワードの管理
        </p>
        <SeedsManager initialSeeds={seeds} />
      </main>
      <Footer />
    </>
  );
}
