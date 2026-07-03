export const CATEGORIES = [
  "消えた場所",
  "消えかける生活技術",
  "家族記録",
  "移住・再生活",
  "ノスタルジー商品化",
  "消失の実況",
  "生活インフラの記録",
  "地域の葬送",
  "家庭内民俗",
  "観光化された記憶",
  "手仕事・身体技術",
  "その他",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PUBLISH_STATUSES = [
  "private",
  "reviewing",
  "public_ready",
  "published",
] as const;

export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const PUBLISH_STATUS_LABELS: Record<PublishStatus, string> = {
  private: "非公開",
  reviewing: "レビュー中",
  public_ready: "公開準備完了",
  published: "公開済み",
};

export const EXPORTABLE_PUBLISH_STATUSES: PublishStatus[] = [
  "public_ready",
  "published",
];

export const CURATION_STATUSES = [
  "unreviewed",
  "keep",
  "ignore",
  "later",
  "article_candidate",
  "meaning_layer_candidate",
] as const;

export type CurationStatus = (typeof CURATION_STATUSES)[number];

export const CURATION_STATUS_LABELS: Record<CurationStatus, string> = {
  unreviewed: "未選別",
  keep: "Keep",
  ignore: "Ignore",
  later: "Later",
  article_candidate: "Article",
  meaning_layer_candidate: "Meaning Layer",
};

export const INITIAL_SEED_KEYWORDS = [
  "閉店 最後の日",
  "廃校 記録",
  "廃村 探訪",
  "古民家 暮らし",
  "田舎暮らし vlog",
  "昭和 商店街",
  "平成 レトロ",
  "祖父母の家",
  "実家 帰省 vlog",
  "ローカル線 車窓",
  "銭湯 閉店",
  "団地 暮らし",
  "町工場 記録",
  "農作業 昔ながら",
  "古い台所",
  "レトロ自販機",
  "純喫茶 閉店",
  "廃線 最終日",
  "取り壊し前",
  "ホームビデオ 昭和",
] as const;

export const SCORE_LABELS: Record<string, string> = {
  placeDisappearance: "場所の消失度",
  lifeTechniqueRarity: "生活技術の希少性",
  generationalMemory: "世代記憶の濃さ",
  locality: "地域性",
  personalArchiveQuality: "個人記録性",
  lowCommercialization: "商業演出の少なさ",
  mourningOrFarewellTone: "追悼・別れの気配",
};
