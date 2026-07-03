import type { YouTubeSearchResult } from "./types";

export const MOCK_VIDEOS: YouTubeSearchResult[] = [
  {
    videoId: "mock001_village_school",
    url: "https://www.youtube.com/watch?v=mock001_village_school",
    title: "【廃校記録】人口300の村、最後の卒業式を撮った",
    description:
      "2024年3月、県立○○中学校が閉校。祖父が教壇に立っていた教室、誰もいなくなった校庭。最後の卒業式の様子を記録しました。",
    channelTitle: "山間の記録係",
    publishedAt: "2024-04-12T08:00:00Z",
    thumbnailUrl: "https://i.ytimg.com/vi/mock001/hqdefault.jpg",
    duration: "12:34",
    viewCount: 8420,
    likeCount: 412,
    commentCount: 67,
    tags: ["廃校", "記録", "地方", "卒業式"],
    comments: [
      "同じような町でもう一所閉校しました。涙が止まりません。",
      "こういう記録を残してくれてありがとう。",
    ],
    rawJson: { source: "mock" },
  },
  {
    videoId: "mock002_shopping_street",
    url: "https://www.youtube.com/watch?v=mock002_shopping_street",
    title: "昭和の商店街、閉店ラッシュの記録｜最後の銭湯",
    description:
      "駅前商店街の老舗銭湯が閉店。タイル張りの脱衣所、古い湯船。最後の営業日を撮影。",
    channelTitle: "retro town walk",
    publishedAt: "2023-11-20T12:00:00Z",
    thumbnailUrl: "https://i.ytimg.com/vi/mock002/hqdefault.jpg",
    duration: "8:21",
    viewCount: 23100,
    likeCount: 890,
    commentCount: 143,
    tags: ["商店街", "銭湯", "閉店", "昭和"],
    comments: ["子供の頃よく行った銭湯です", "もう二度と入れないのが悲しい"],
    rawJson: { source: "mock" },
  },
  {
    videoId: "mock003_grandparents",
    url: "https://www.youtube.com/watch?v=mock003_grandparents",
    title: "祖父母の家、解体前に残した実家の記録",
    description:
      "築60年の木造平屋。縁側、古い台所、畳の部屋。取り壊し前に家族で撮影しました。",
    channelTitle: "田中家の記録",
    publishedAt: "2024-01-05T06:30:00Z",
    thumbnailUrl: "https://i.ytimg.com/vi/mock003/hqdefault.jpg",
    duration: "15:02",
    viewCount: 15600,
    likeCount: 1203,
    commentCount: 201,
    tags: ["実家", "祖父母", "古民家", "解体"],
    comments: ["うちも同じ経験をしました", "台所の様子が懐かしい"],
    rawJson: { source: "mock" },
  },
  {
    videoId: "mock004_local_train",
    url: "https://www.youtube.com/watch?v=mock004_local_train",
    title: "廃線前のローカル線、車窓から見た最後の風景",
    description:
      "来春廃止予定の第三セクター線。無人駅、田園、小さな町。最終日まで走る列車の車窓から。",
    channelTitle: "ローカル線の旅人",
    publishedAt: "2023-09-15T10:00:00Z",
    thumbnailUrl: "https://i.ytimg.com/vi/mock004/hqdefault.jpg",
    duration: "22:18",
    viewCount: 45200,
    likeCount: 2100,
    commentCount: 312,
    tags: ["ローカル線", "廃線", "車窓", "地方"],
    comments: ["この路線、学生時代毎日乗ってました", "最後の日も撮りに行きます"],
    rawJson: { source: "mock" },
  },
  {
    videoId: "mock005_farm_kitchen",
    url: "https://www.youtube.com/watch?v=mock005_farm_kitchen",
    title: "母の台所｜昔ながらの味噌作りを残す",
    description:
      "88歳の母が毎年作る味噌。石臼、木桶、薪のかまど。手の動きを記録。",
    channelTitle: "里山の手仕事",
    publishedAt: "2024-02-28T14:00:00Z",
    thumbnailUrl: "https://i.ytimg.com/vi/mock005/hqdefault.jpg",
    duration: "18:45",
    viewCount: 9800,
    likeCount: 756,
    commentCount: 89,
    tags: ["台所", "味噌", "手仕事", "農村"],
    comments: ["うちの祖母も同じやり方でした", "技術が残らないのが心配"],
    rawJson: { source: "mock" },
  },
  {
    videoId: "mock006_danchi",
    url: "https://www.youtube.com/watch?v=mock006_danchi",
    title: "団地暮らしvlog｜築50年の公営住宅で",
    description:
      "再開発前の団地。共用廊下、小さなベランダ、近所のおばあちゃん。日常を記録。",
    channelTitle: "団地日記",
    publishedAt: "2024-05-01T09:00:00Z",
    thumbnailUrl: "https://i.ytimg.com/vi/mock006/hqdefault.jpg",
    duration: "10:11",
    viewCount: 6700,
    likeCount: 445,
    commentCount: 56,
    tags: ["団地", "暮らし", "vlog", "記録"],
    comments: ["この団地、来年取り壊しです", "日常が一番消えやすい"],
    rawJson: { source: "mock" },
  },
];

export const MOCK_ANALYSES: Record<
  string,
  {
    category: string;
    vanishingLifeScore: number;
    scores: {
      placeDisappearance: number;
      lifeTechniqueRarity: number;
      generationalMemory: number;
      locality: number;
      personalArchiveQuality: number;
      lowCommercialization: number;
      mourningOrFarewellTone: number;
    };
    observe: string;
    sample: string;
    recombine: string;
    question: string;
    fieldNoteTitle: string;
    fieldNote: string;
    tags: string[];
    articleAngle?: string;
    articleTitleCandidates?: string[];
  }
> = {
  mock001_village_school: {
    category: "消失の実況",
    vanishingLifeScore: 28,
    scores: {
      placeDisappearance: 5,
      lifeTechniqueRarity: 2,
      generationalMemory: 5,
      locality: 5,
      personalArchiveQuality: 4,
      lowCommercialization: 4,
      mourningOrFarewellTone: 5,
    },
    observe:
      "人口300の村の廃校、最後の卒業式を記録した動画。祖父が教壇に立っていた教室という個人的文脈がタイトル・説明に含まれる。",
    sample: "地方の廃校と、それに付随する世代記憶の断片。",
    recombine:
      "廃校動画は、地域の未来が止まった場所を巡礼する映像である。公式記録では拾えない、空になった校庭の静けさが残る。",
    question: "学校がなくなったあと、村の時間はどこから始まるのか。",
    fieldNoteTitle: "最後の卒業式 — 廃校前の村",
    fieldNote:
      "この記録は、地方における公共空間の縮小を個人の視点から保存しようとする試みである。タイトルに「最後の卒業式」、説明に「祖父が教壇に立っていた教室」とあり、場所の消失と家族記憶が重なっている。視聴数8,000超は小規模だが、コメント欄には同様の経験を持つ視聴者の追悼的な言葉が見られる。動画本体は未視聴だが、メタデータからは「消失の実況」としての性格が強い。将来、このような個人記録が公式の地方史資料を補完する可能性がある。一方で、廃校という題材は既に一定の文法化（感傷的ナレーション、空の教室の定番カット）も進んでおり、記録と演出の境界も問われる。",
    tags: ["廃校", "地方", "卒業式", "消失"],
    articleAngle: "廃校は地域の葬送儀礼として記録される",
    articleTitleCandidates: [
      "最後の卒業式は、村の時間を止める葬送なのか",
      "廃校記録が残す、消えた公共空間の静けさ",
      "学校がなくなったあと、記憶はどこに置かれるか",
    ],
  },
  mock002_shopping_street: {
    category: "消えた場所",
    vanishingLifeScore: 26,
    scores: {
      placeDisappearance: 5,
      lifeTechniqueRarity: 1,
      generationalMemory: 4,
      locality: 4,
      personalArchiveQuality: 3,
      lowCommercialization: 4,
      mourningOrFarewellTone: 5,
    },
    observe:
      "昭和の商店街における銭湯閉店の記録。最後の営業日、タイル張りの脱衣所と古い湯船が説明に言及される。",
    sample: "都市・地方双方で消えつつある銭湯と商店街の生活空間。",
    recombine:
      "閉店動画は、商店街の葬送儀礼になっている。銭湯は単なる施設ではなく、地域の身体習慣のインフラだった。",
    question: "共有の湯がなくなったあと、近所の関係はどこで温まるのか。",
    fieldNoteTitle: "最後の銭湯 — 商店街の閉店記録",
    fieldNote:
      "Seed Keyword「銭湯 閉店」に沿った典型的な消失記録。チャンネル名からウォーク系・記録系の個人発信と推測される。視聴2万超、コメント143件は、この題材への共感の広さを示す。「子供の頃よく行った」というコメントは、個人記憶が公共空間の消失と結びつく様子を示す。タイル、湯船といった具体的な物質記述があり、Field Noteとしての観測精度は高い。",
    tags: ["銭湯", "商店街", "閉店", "昭和"],
  },
  mock003_grandparents: {
    category: "家族記録",
    vanishingLifeScore: 30,
    scores: {
      placeDisappearance: 4,
      lifeTechniqueRarity: 2,
      generationalMemory: 5,
      locality: 3,
      personalArchiveQuality: 5,
      lowCommercialization: 5,
      mourningOrFarewellTone: 4,
    },
    observe:
      "築60年の祖父母の実家を解体前に記録。縁側、古い台所、畳。家族チャンネル名から個人アーカイブ性が高い。",
    sample: "家族記録と民俗資料の境界にある、実家・古民家の解体前記録。",
    recombine:
      "祖父母の家の動画は、家族アーカイブと民俗資料の境界にある。住宅の解体は、家族制度の物理的なUIの消去でもある。",
    question: "実家がなくなったあと、帰省はどこへ向かうのか。",
    fieldNoteTitle: "解体前の実家 — 家族アーカイブ",
    fieldNote:
      "個人チャンネル「田中家の記録」による、取り壊し前の実家記録。説明文の「縁側、古い台所、畳」は、日本の住宅文化の典型要素を列挙しており、記録意図が明確である。視聴1.5万、高いいいね率は、同世代の共感を示す。商業的演出の痕跡は薄く、個人記録性が高い。メタデータのみの観測だが、ホームビデオ伝統の延長線上にあるデジタル民俗資料として位置づけられる。",
    tags: ["実家", "祖父母", "古民家", "家族"],
    articleAngle: "解体前の実家記録は家庭内民俗のアーカイブ",
    articleTitleCandidates: [
      "実家がなくなったあと、帰省はどこへ向かうのか",
      "祖父母の家を撮ることは、家族制度を記録すること",
      "ホームビデオ以後の、デジタル実家記録",
    ],
  },
  mock004_local_train: {
    category: "消えた場所",
    vanishingLifeScore: 27,
    scores: {
      placeDisappearance: 5,
      lifeTechniqueRarity: 1,
      generationalMemory: 4,
      locality: 5,
      personalArchiveQuality: 3,
      lowCommercialization: 4,
      mourningOrFarewellTone: 4,
    },
    observe:
      "廃線前の第三セクター線、車窓からの風景記録。無人駅、田園、小さな町が説明に含まれる。",
    sample: "ローカル線廃止に伴う、移動と風景の記録。",
    recombine:
      "ローカル線の車窓動画は、移動手段ではなく、失われる時間感覚の保存である。",
    question: "路線が消えたあと、距離の感覚はどう変わるのか。",
    fieldNoteTitle: "廃線前の車窓 — ローカル線の記録",
    fieldNote:
      "廃止予定路線の車窓記録。視聴4.5万とMock数据中では最大級で、ローカル線題材への関心の高さを示す。コメント「学生時代毎日乗ってました」は、交通インフラと個人史の結合を示す。22分の尺は、単なるショートではなく、時間をかけた観測である可能性。",
    tags: ["ローカル線", "廃線", "車窓", "地方交通"],
  },
  mock005_farm_kitchen: {
    category: "消えかける生活技術",
    vanishingLifeScore: 29,
    scores: {
      placeDisappearance: 2,
      lifeTechniqueRarity: 5,
      generationalMemory: 5,
      locality: 4,
      personalArchiveQuality: 4,
      lowCommercialization: 5,
      mourningOrFarewellTone: 2,
    },
    observe:
      "88歳の母による味噌作りの記録。石臼、木桶、薪のかまど。手の動きを撮る意図が説明にある。",
    sample: "台所における生活技術（味噌作り）の映像記録。",
    recombine:
      "古い台所の動画は、家族制度のUIを記録している。味噌作りは、単なる料理ではなく、年周期の生活リズムの保存。",
    question: "手の動きは、誰が次の世代に渡すのか。",
    fieldNoteTitle: "母の台所 — 味噌作りの記録",
    fieldNote:
      "生活技術の希少性が最も高いMock記録。追悼色は薄いが、技術継承の危機が背景にある。チャンネル名「里山の手仕事」は、意図的な技術記録プロジェクトを示唆。コメント「技術が残らないのが心配」は、視聴者側の不安の表明でもある。",
    tags: ["台所", "味噌", "手仕事", "生活技術"],
  },
  mock006_danchi: {
    category: "移住・再生活",
    vanishingLifeScore: 22,
    scores: {
      placeDisappearance: 4,
      lifeTechniqueRarity: 1,
      generationalMemory: 3,
      locality: 4,
      personalArchiveQuality: 4,
      lowCommercialization: 3,
      mourningOrFarewellTone: 3,
    },
    observe:
      "再開発前の公営団地での暮らしvlog。共用廊下、ベランダ、近所の関係性が説明に含まれる。",
    sample: "消滅前の団地日常を記録する、再生活・記録の混合。",
    recombine:
      "団地vlogは、いずれ消える日常を先取りして保存する試み。再開発前の「普通」を未来の参照点にする。",
    question: "再開発後、団地の記憶はどのメディアに残るのか。",
    fieldNoteTitle: "団地日記 — 再開発前の日常",
    fieldNote:
      "Seed Keyword「団地 暮らし」に対応する記録。vlog形式だが、コメント「来年取り壊し」から、消失を見越した記録性が読み取れる。商業演出（vlog文法）と個人記録の間に位置する。",
    tags: ["団地", "vlog", "再開発", "日常"],
  },
};
