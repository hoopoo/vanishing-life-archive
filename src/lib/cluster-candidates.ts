export interface ClusterCandidateRule {
  categories: string[];
  keywords: string[];
}

export const CLUSTER_CANDIDATE_RULES: Record<string, ClusterCandidateRule> = {
  地域の葬送: {
    categories: ["消失の実況", "消えた場所", "地域の葬送"],
    keywords: [
      "閉店",
      "廃校",
      "廃線",
      "取り壊し",
      "最後の日",
      "最終日",
      "解体",
      "廃村",
      "閉業",
    ],
  },
  家庭内民俗: {
    categories: ["家族記録", "消えかける生活技術", "家庭内民俗"],
    keywords: [
      "祖父母",
      "実家",
      "帰省",
      "台所",
      "味噌",
      "手仕事",
      "ホームビデオ",
      "母",
      "父",
      "家族",
      "法事",
    ],
  },
  生活インフラの記憶装置化: {
    categories: ["ノスタルジー商品化", "生活インフラの記録"],
    keywords: [
      "レトロ自販機",
      "自販機",
      "純喫茶",
      "銭湯",
      "駄菓子屋",
      "商店街",
      "昭和レトロ",
      "平成レトロ",
      "巡礼",
      "観光化",
    ],
  },
  失われる移動感覚: {
    categories: ["生活インフラの記録", "消えた場所"],
    keywords: [
      "ローカル線",
      "車窓",
      "廃線",
      "駅",
      "バス",
      "通学路",
      "最終列車",
      "最終日",
      "交通",
      "移動",
    ],
  },
  "昭和・平成の生活記憶": {
    categories: ["ノスタルジー商品化", "家族記録"],
    keywords: [
      "昭和",
      "平成",
      "レトロ",
      "ホームビデオ",
      "団地",
      "古い家電",
      "商店街",
      "近過去",
    ],
  },
};

export interface VideoForMatching {
  id: number;
  title: string;
  description: string;
  category: string | null;
  analysisTags: string[];
  fieldNoteTitle: string | null;
  fieldNote: string | null;
  humanNote: string | null;
  vanishingLifeScore: number;
}

export function scoreVideoForCluster(
  video: VideoForMatching,
  rule: ClusterCandidateRule
): number {
  let score = 0;

  if (video.category && rule.categories.includes(video.category)) {
    score += 10;
  }

  const haystack = [
    video.title,
    video.description,
    video.fieldNoteTitle ?? "",
    video.fieldNote ?? "",
    video.humanNote ?? "",
    ...video.analysisTags,
  ]
    .join(" ")
    .toLowerCase();

  for (const keyword of rule.keywords) {
    if (haystack.includes(keyword.toLowerCase())) {
      score += 3;
    }
  }

  if (score > 0) {
    score += video.vanishingLifeScore * 0.1;
  }

  return score;
}

export function matchesClusterRules(
  video: VideoForMatching,
  rule: ClusterCandidateRule
): boolean {
  return scoreVideoForCluster(video, rule) > 0;
}

export const CLUSTER_ITEM_NOTE_PLACEHOLDER =
  "この動画をこのClusterに入れる理由を書く。\n例：移動手段の消失というより、地域の時間感覚を見送る動画として読む。";
