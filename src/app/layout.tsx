import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Vanishing Life Archive — 生活の消失ログ",
  description:
    "YouTube上の生活記録を、未来の民俗資料として観測・分類・解釈する。SHIRO & Co.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSerif.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#f4f1ec] font-sans text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
