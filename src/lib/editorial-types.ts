export type EditorialActionType =
  | "observe_tone"
  | "ideological"
  | "concrete_rewrite"
  | "reduce_hype"
  | "regenerate_titles"
  | "regenerate_outline"
  | "book_format"
  | "linkedin_post"
  | "note_intro";

export const EDITORIAL_ACTIONS: {
  type: EditorialActionType;
  label: string;
  description: string;
  group: "observe" | "deepen" | "derive";
}[] = [
  {
    type: "observe_tone",
    label: "観測文に整える",
    description: "book.shiroand.io向けの静かな観測文へ",
    group: "observe",
  },
  {
    type: "concrete_rewrite",
    label: "具体から書き直す",
    description: "映像描写から始める本文へ",
    group: "observe",
  },
  {
    type: "reduce_hype",
    label: "煽りを弱める",
    description: "説明口調・抽象表現を減らす",
    group: "observe",
  },
  {
    type: "ideological",
    label: "思想文に寄せる",
    description: "SHIRO & Co. の思想を自然に織り込む",
    group: "deepen",
  },
  {
    type: "book_format",
    label: "book.shiroand.io向けに整える",
    description: "公開向けフォーマットに調整",
    group: "deepen",
  },
  {
    type: "regenerate_titles",
    label: "タイトル案を再生成",
    description: "5種類のタイトル案",
    group: "deepen",
  },
  {
    type: "regenerate_outline",
    label: "Outlineを再生成",
    description: "3〜6個の見出し構成",
    group: "deepen",
  },
  {
    type: "linkedin_post",
    label: "LinkedIn告知文を作る",
    description: "300〜500字の投稿文",
    group: "derive",
  },
  {
    type: "note_intro",
    label: "note向け導入文を作る",
    description: "500〜800字の冒頭",
    group: "derive",
  },
];

export function getEditorialActionLabel(actionType: string): string {
  return (
    EDITORIAL_ACTIONS.find((a) => a.type === actionType)?.label ?? actionType
  );
}
