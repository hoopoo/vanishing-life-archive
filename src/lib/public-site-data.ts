import type { PublicBundle } from "./publish-types";
import type { PublicDashboardStats } from "./public-stats-types";

export interface PublicSiteData {
  generatedAt: string;
  bundle: PublicBundle;
  stats: PublicDashboardStats;
}

let cached: PublicSiteData | null = null;

export function isStaticPublicSite(): boolean {
  return process.env.PUBLIC_STATIC_DATA === "1";
}

export function isPublicSiteMode(): boolean {
  return process.env.NEXT_PUBLIC_PUBLIC_SITE === "1";
}

export async function loadPublicSiteData(): Promise<PublicSiteData> {
  if (cached) return cached;
  const data = (await import("@/data/public-site.json")).default as PublicSiteData;
  cached = data;
  return data;
}
