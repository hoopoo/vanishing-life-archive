import Link from "next/link";
import { isPublicSiteMode } from "@/lib/public-site-data";

const localNavItems = [
  { href: "/", label: "Home" },
  { href: "/videos", label: "Videos" },
  { href: "/clusters", label: "Clusters" },
  { href: "/article-studio", label: "Article Studio" },
  { href: "/export", label: "Export" },
  { href: "/public-preview", label: "Public Preview" },
  { href: "/seeds", label: "Seeds" },
  { href: "/run", label: "Run Observation" },
];

const publicNavItems = [
  { href: "/public-preview", label: "Home" },
  { href: "/public-preview/videos", label: "Videos" },
  { href: "/public-preview/field-notes", label: "Field Notes" },
  { href: "/public-preview/meaning-layer", label: "Meaning Layer" },
  { href: "/public-preview/articles", label: "Articles" },
  { href: "/public-preview/clusters", label: "Clusters" },
];

const publicSiteNavItems = [
  { href: "/", label: "Home" },
  { href: "/public-preview/videos", label: "Videos" },
  { href: "/public-preview/field-notes", label: "Field Notes" },
  { href: "/public-preview/meaning-layer", label: "Meaning Layer" },
  { href: "/public-preview/articles", label: "Articles" },
  { href: "/public-preview/clusters", label: "Clusters" },
];

export function Header({ mode = "local" }: { mode?: "local" | "public" }) {
  const publicSite = isPublicSiteMode();
  const navItems =
    mode === "public"
      ? publicSite
        ? publicSiteNavItems
        : [...publicNavItems, { href: "/export", label: "← Local Export" }]
      : localNavItems;

  return (
    <header className="border-b border-stone-200 bg-[#f9f7f4]">
      {mode === "local" ? (
        <div className="border-b border-stone-200 bg-stone-100 px-4 py-2 text-center text-xs text-stone-600">
          <span className="tracking-widest uppercase">Local Observatory</span>
          <span className="mx-2">—</span>
          内部観測用。未整理の動画、AI分析、Human Noteを含む。
        </div>
      ) : (
        <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900/80">
          <span className="tracking-widest uppercase">Public Preview</span>
          <span className="mx-2">—</span>
          外部公開予定の内容だけを表示しています。
        </div>
      )}
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] text-stone-500 uppercase">
            SHIRO & Co.
          </p>
          <h1 className="font-serif text-xl text-stone-900 sm:text-2xl">
            Vanishing Life Archive
          </h1>
          <p className="text-sm text-stone-600">生活の消失ログ</p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-stone-700 transition hover:text-stone-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer({ mode = "local" }: { mode?: "local" | "public" }) {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-[#f9f7f4] px-4 py-6 text-center text-xs text-stone-500">
      {mode === "local" ? (
        <p className="tracking-wide uppercase text-stone-400">
          Local Observatory — 内部観測用
        </p>
      ) : (
        <p className="tracking-wide uppercase text-amber-700/70">
          Public Preview — 公開予定コンテンツ
        </p>
      )}
      <p className="mt-2">スマホ動画は、未来の民俗資料館になる</p>
      <p className="mt-1">
        Kosuke Protocol — Observe · Sample · Recombine · Question
      </p>
    </footer>
  );
}
