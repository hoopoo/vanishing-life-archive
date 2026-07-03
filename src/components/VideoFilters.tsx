"use client";

import {
  CURATION_STATUSES,
  CURATION_STATUS_LABELS,
} from "@/lib/constants";

interface VideoFiltersProps {
  categories: string[];
  seeds: string[];
  clusters: Array<{ id: number; title: string }>;
  values: {
    category: string;
    seedKeyword: string;
    status: string;
    curationStatus: string;
    minScore: string;
    maxScore: string;
    isFeatured: string;
    clusterId: string;
  };
}

export function VideoFilters({ categories, seeds, clusters, values }: VideoFiltersProps) {
  return (
    <form
      method="get"
      className="mt-6 grid gap-3 border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="text-xs text-stone-600">
        カテゴリ
        <select
          name="category"
          defaultValue={values.category}
          className="mt-1 w-full border border-stone-300 px-2 py-1 text-sm"
        >
          <option value="">すべて</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-stone-600">
        Seed Keyword
        <select
          name="seedKeyword"
          defaultValue={values.seedKeyword}
          className="mt-1 w-full border border-stone-300 px-2 py-1 text-sm"
        >
          <option value="">すべて</option>
          {seeds.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-stone-600">
        分析状態
        <select
          name="status"
          defaultValue={values.status}
          className="mt-1 w-full border border-stone-300 px-2 py-1 text-sm"
        >
          <option value="">すべて</option>
          <option value="analyzed">analyzed</option>
          <option value="unanalyzed">unanalyzed</option>
        </select>
      </label>
      <label className="text-xs text-stone-600">
        キュレーション
        <select
          name="curationStatus"
          defaultValue={values.curationStatus}
          className="mt-1 w-full border border-stone-300 px-2 py-1 text-sm"
        >
          <option value="">すべて</option>
          {CURATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {CURATION_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-stone-600">
        最小スコア
        <input
          type="number"
          name="minScore"
          min={0}
          max={35}
          defaultValue={values.minScore}
          className="mt-1 w-full border border-stone-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="text-xs text-stone-600">
        最大スコア
        <input
          type="number"
          name="maxScore"
          min={0}
          max={35}
          defaultValue={values.maxScore}
          className="mt-1 w-full border border-stone-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="text-xs text-stone-600">
        Cluster
        <select
          name="clusterId"
          defaultValue={values.clusterId}
          className="mt-1 w-full border border-stone-300 px-2 py-1 text-sm"
        >
          <option value="">すべて</option>
          {clusters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-stone-600">
        Featured
        <select
          name="isFeatured"
          defaultValue={values.isFeatured}
          className="mt-1 w-full border border-stone-300 px-2 py-1 text-sm"
        >
          <option value="">すべて</option>
          <option value="true">featured のみ</option>
        </select>
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          className="border border-stone-700 px-4 py-2 text-sm text-stone-800 hover:bg-stone-50"
        >
          フィルター適用
        </button>
      </div>
    </form>
  );
}
