import OpenAI from "openai";
import { prisma } from "./prisma";
import {
  serializeArticleDraft,
  getArticleDraftById,
  normalizeOutline,
} from "./article";
import type {
  ArticleGenerationResult,
  ArticleOutlineItem,
  SerializedArticleDraft,
  TitleCandidate,
} from "./article-types";
import type { EditorialActionType } from "./editorial-types";
import { getEditorialActionLabel } from "./editorial-types";

const FULL_ARTICLE_JSON = `{
  "title": "",
  "subtitle": "",
  "theme": "",
  "angle": "",
  "lead": "",
  "outline": [{"heading": "見出し", "summary": "この章で扱う内容"}],
  "bodyDraft": "",
  "questions": [],
  "tags": []
}`;

const OBSERVE_TONE_PROMPT = `あなたはSHIRO & Co.の編集者です。
以下の記事下書きを、book.shiroand.io向けの静かな観測文に整えてください。

方針：

- 一般的なAI作文に見える抽象表現を減らす
- 具体的な生活の断片から書き始める
- 「重要である」「意味がある」などの説明口調を減らす
- 断定しすぎない
- 煽らない
- 感動話に寄せすぎない
- 生活、道具、場所、手の動き、時間、記憶を丁寧に扱う
- Kosuke ProtocolのObserve / Sample / Recombine / Questionの流れを自然に反映する
- 「スマホ動画は、未来の民俗資料館になる」という思想を必要に応じて含める
- outlineは必ず3〜6個の見出しを含める
- Markdownは使わない
- JSONのみ返す

返却JSON：
${FULL_ARTICLE_JSON}`;

const CONCRETE_REWRITE_PROMPT = `あなたはSHIRO & Co.の編集者です。
以下の記事下書きを、具体から書き直してください。

方針：

- 冒頭は必ず具体的な映像描写から始める
- 「動画に映っているのは」「画面の中では」「そこにあるのは」などから始めてもよい
- 最初の3段落では、大きな概念を出しすぎない
- 後半で、家庭内民俗、生活技術、記憶の継承、生活の消失へ接続する
- 一般的なAI作文に見える抽象表現を減らす
- outlineは必ず3〜6個の見出しを含める
- Markdownは使わない
- JSONのみ返す

返却JSON：
${FULL_ARTICLE_JSON}`;

const IDEOLOGICAL_PROMPT = `あなたはSHIRO & Co.のBoundary Designerです。
以下の記事下書きを、SHIRO & Co. / book.shiroand.ioの思想文に寄せてください。

方針：

- 「生活は、消える直前に撮られはじめる」「スマホ動画は、未来の民俗資料館になる」を自然に織り込む
- 生活のOS（台所、実家、商店街、銭湯、団地、ローカル線、古民家）の視点を活かす
- 閉店、廃校、廃線、取り壊しを地域の葬送として扱う
- 静かな観測文を保ち、説教や煽りにしない
- outlineは必ず3〜6個の見出しを含める
- Markdownは使わない
- JSONのみ返す

返却JSON：
${FULL_ARTICLE_JSON}`;

const REDUCE_HYPE_PROMPT = `あなたはSHIRO & Co.の編集者です。
以下の記事下書きから、煽り・説明口調・過剰な抽象表現を弱めてください。

方針：

- 「重要である」「意味がある」「本質的に」などの説明口調を減らす
- 感嘆符、大げさな形容、断定しすぎる表現を弱める
- 静かな観測文として読めるトーンにする
- 内容の骨格は維持する
- outlineは必ず3〜6個の見出しを含める
- Markdownは使わない
- JSONのみ返す

返却JSON：
${FULL_ARTICLE_JSON}`;

const BOOK_FORMAT_PROMPT = `あなたはbook.shiroand.ioの編集者です。
以下の記事下書きを、book.shiroand.ioに公開できる形式に整えてください。

方針：

- タイトル・サブタイトル・リード・本文の流れを整える
- 章立て（outline）と本文の対応を明確にする
- 静かな観測文として読める文体を保つ
- 出典動画への言及は控えめに、観測の文脈として自然に
- outlineは必ず3〜6個の見出しを含める
- Markdownは使わない（本文もプレーンテキスト）
- JSONのみ返す

返却JSON：
${FULL_ARTICLE_JSON}`;

const REGENERATE_OUTLINE_PROMPT = `あなたはSHIRO & Co.の編集者です。
以下の記事下書きに合うOutline（見出し構成）を再生成してください。

条件：

- 必ず3〜6個の見出しを生成する
- 各見出しには summary（この章で扱う内容）を付ける
- 記事のテーマ・切り口・本文に整合する
- Kosuke Protocol（Observe / Sample / Recombine / Question）の流れを意識してよい
- JSONのみ返す

返却JSON：
{
  "outline": [{"heading": "見出し", "summary": "この章で扱う内容"}]
}`;

const REGENERATE_TITLES_PROMPT = `あなたはSHIRO & Co.の編集者です。
以下の記事下書きから、タイトル案を5つ生成してください。

種類を分けてください。

- 観測文タイトル
- 思想文タイトル
- note向けタイトル
- book.shiroand.io向けタイトル
- LinkedIn向けタイトル

返却JSON：
{
  "titleCandidates": [
    {"type": "観測文タイトル", "title": ""}
  ]
}`;

const LINKEDIN_PROMPT = `あなたはSHIRO & Co.の編集者です。
以下のArticle DraftからLinkedIn投稿文を生成してください。

条件：

- 300〜500字
- 宣伝っぽくしすぎない
- なぜこの観測をしたのかを書く
- 最後に記事リンクを置けるようにする（URLは [記事リンク] とプレースホルダーでよい）
- ハッシュタグは最大3つ
- JSONのみ返す

返却JSON：
{
  "linkedinPost": ""
}`;

const NOTE_INTRO_PROMPT = `あなたはSHIRO & Co.の編集者です。
以下のArticle Draftからnoteの冒頭に使える導入文を生成してください。

条件：

- 500〜800字
- 読者に問いかける
- 生活の具体から入る
- 抽象概念を急ぎすぎない
- 最後に本文へ自然につなぐ
- JSONのみ返す

返却JSON：
{
  "noteIntro": ""
}`;

function draftToLlmInput(draft: SerializedArticleDraft) {
  return {
    title: draft.title,
    subtitle: draft.subtitle,
    theme: draft.theme,
    angle: draft.angle,
    lead: draft.lead,
    outline: draft.outline,
    bodyDraft: draft.bodyDraft,
    questions: draft.questions,
    tags: draft.tags,
    selectedVideos: draft.selectedVideos?.map((v) => ({
      title: v.title,
      channelTitle: v.channelTitle,
    })),
  };
}

function draftSnapshot(draft: SerializedArticleDraft): string {
  return JSON.stringify({
    title: draft.title,
    subtitle: draft.subtitle,
    theme: draft.theme,
    angle: draft.angle,
    lead: draft.lead,
    outline: draft.outline,
    bodyDraft: draft.bodyDraft,
    questions: draft.questions,
    tags: draft.tags,
    titleCandidates: draft.titleCandidates,
    linkedinPost: draft.linkedinPost,
    noteIntro: draft.noteIntro,
    status: draft.status,
  });
}

function applyFullArticleResult(
  draft: SerializedArticleDraft,
  result: ArticleGenerationResult
): Partial<SerializedArticleDraft> {
  return {
    title: result.title || draft.title,
    subtitle: result.subtitle ?? draft.subtitle,
    theme: result.theme || draft.theme,
    angle: result.angle || draft.angle,
    lead: result.lead || draft.lead,
    outline: normalizeOutline(result.outline, draft.theme),
    bodyDraft: result.bodyDraft || draft.bodyDraft,
    questions: result.questions?.length ? result.questions : draft.questions,
    tags: result.tags?.length ? result.tags : draft.tags,
  };
}

function mockFullArticleRewrite(
  draft: SerializedArticleDraft,
  suffix: string
): ArticleGenerationResult {
  const outline = normalizeOutline(draft.outline, draft.theme);
  return {
    title: draft.title,
    subtitle: draft.subtitle,
    theme: draft.theme,
    angle: draft.angle,
    lead: draft.lead.replace(/^/, "（編集: " + suffix + "）"),
    outline,
    bodyDraft: draft.bodyDraft,
    questions: draft.questions,
    tags: draft.tags,
  };
}

function mockTitleCandidates(draft: SerializedArticleDraft): TitleCandidate[] {
  const base = draft.title.replace(/[—\-].*$/, "").trim() || "観測メモ";
  return [
    { type: "観測文タイトル", title: `${base} — 静かな記録` },
    { type: "思想文タイトル", title: `スマホ動画は、未来の民俗資料館になる — ${base}` },
    { type: "note向けタイトル", title: `${base}を見たあと、残るもの` },
    { type: "book.shiroand.io向けタイトル", title: base },
    { type: "LinkedIn向けタイトル", title: `なぜ今、${base}を観測するのか` },
  ];
}

async function callLlm(
  systemPrompt: string,
  draft: SerializedArticleDraft,
  useMock: boolean
): Promise<Record<string, unknown>> {
  if (useMock || !process.env.OPENAI_API_KEY?.trim()) {
    return {};
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `記事下書き：\n${JSON.stringify(draftToLlmInput(draft), null, 2)}`,
      },
    ],
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty response");
  return JSON.parse(content) as Record<string, unknown>;
}

async function saveRevisionAndUpdate(
  draftId: number,
  actionType: EditorialActionType,
  before: SerializedArticleDraft,
  afterFields: {
    title?: string;
    subtitle?: string;
    theme?: string;
    angle?: string;
    lead?: string;
    outlineJson?: string;
    bodyDraft?: string;
    questionsJson?: string;
    tagsJson?: string;
    titleCandidatesJson?: string | null;
    linkedinPost?: string | null;
    noteIntro?: string | null;
  }
) {
  await prisma.articleDraft.update({
    where: { id: draftId },
    data: afterFields,
  });

  const afterDraft = await getArticleDraftById(draftId);
  if (!afterDraft) throw new Error("Draft not found after update");

  await prisma.articleRevision.create({
    data: {
      articleDraftId: draftId,
      actionType,
      beforeJson: draftSnapshot(before),
      afterJson: draftSnapshot(afterDraft),
    },
  });

  return afterDraft;
}

export async function runEditorialAction(
  draftId: number,
  actionType: EditorialActionType,
  useMock = false
): Promise<SerializedArticleDraft> {
  const before = await getArticleDraftById(draftId);
  if (!before) throw new Error("Draft not found");

  switch (actionType) {
    case "observe_tone":
    case "ideological":
    case "concrete_rewrite":
    case "reduce_hype":
    case "book_format": {
      const prompts: Record<string, string> = {
        observe_tone: OBSERVE_TONE_PROMPT,
        ideological: IDEOLOGICAL_PROMPT,
        concrete_rewrite: CONCRETE_REWRITE_PROMPT,
        reduce_hype: REDUCE_HYPE_PROMPT,
        book_format: BOOK_FORMAT_PROMPT,
      };
      let result: ArticleGenerationResult;
      if (useMock || !process.env.OPENAI_API_KEY?.trim()) {
        result = mockFullArticleRewrite(
          before,
          getEditorialActionLabel(actionType)
        );
      } else {
        const parsed = await callLlm(prompts[actionType], before, useMock);
        result = parsed as unknown as ArticleGenerationResult;
      }
      const applied = applyFullArticleResult(before, result);
      return saveRevisionAndUpdate(draftId, actionType, before, {
        title: applied.title,
        subtitle: applied.subtitle,
        theme: applied.theme,
        angle: applied.angle,
        lead: applied.lead,
        outlineJson: JSON.stringify(applied.outline),
        bodyDraft: applied.bodyDraft,
        questionsJson: JSON.stringify(applied.questions),
        tagsJson: JSON.stringify(applied.tags),
      });
    }

    case "regenerate_outline": {
      let outline: ArticleOutlineItem[];
      if (useMock || !process.env.OPENAI_API_KEY?.trim()) {
        outline = normalizeOutline([], before.theme);
      } else {
        const parsed = await callLlm(REGENERATE_OUTLINE_PROMPT, before, useMock);
        outline = normalizeOutline(
          (parsed.outline as ArticleOutlineItem[]) ?? [],
          before.theme
        );
      }
      return saveRevisionAndUpdate(draftId, actionType, before, {
        outlineJson: JSON.stringify(outline),
      });
    }

    case "regenerate_titles": {
      let titleCandidates: TitleCandidate[];
      if (useMock || !process.env.OPENAI_API_KEY?.trim()) {
        titleCandidates = mockTitleCandidates(before);
      } else {
        const parsed = await callLlm(REGENERATE_TITLES_PROMPT, before, useMock);
        titleCandidates = (parsed.titleCandidates as TitleCandidate[]) ?? [];
        if (titleCandidates.length === 0) {
          titleCandidates = mockTitleCandidates(before);
        }
      }
      return saveRevisionAndUpdate(draftId, actionType, before, {
        titleCandidatesJson: JSON.stringify(titleCandidates),
      });
    }

    case "linkedin_post": {
      let linkedinPost: string;
      if (useMock || !process.env.OPENAI_API_KEY?.trim()) {
        linkedinPost = `${before.lead.slice(0, 200)}…\n\nなぜこの観測をしたのか — ${before.theme}。\n\n[記事リンク]\n\n#生活文化 #民俗 #観測`;
      } else {
        const parsed = await callLlm(LINKEDIN_PROMPT, before, useMock);
        linkedinPost = (parsed.linkedinPost as string) ?? "";
      }
      return saveRevisionAndUpdate(draftId, actionType, before, {
        linkedinPost,
      });
    }

    case "note_intro": {
      let noteIntro: string;
      if (useMock || !process.env.OPENAI_API_KEY?.trim()) {
        noteIntro = `${before.lead}\n\n${before.bodyDraft.slice(0, 400)}…\n\n— 以下、本文へ続く。`;
      } else {
        const parsed = await callLlm(NOTE_INTRO_PROMPT, before, useMock);
        noteIntro = (parsed.noteIntro as string) ?? "";
      }
      return saveRevisionAndUpdate(draftId, actionType, before, {
        noteIntro,
      });
    }

    default:
      throw new Error(`Unknown action: ${actionType}`);
  }
}

export async function getArticleRevisions(draftId: number) {
  const revisions = await prisma.articleRevision.findMany({
    where: { articleDraftId: draftId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return revisions.map((r) => ({
    id: r.id,
    articleDraftId: r.articleDraftId,
    actionType: r.actionType,
    actionLabel: getEditorialActionLabel(r.actionType),
    createdAt: r.createdAt.toISOString(),
  }));
}
