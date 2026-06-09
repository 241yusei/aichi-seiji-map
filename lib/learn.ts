// まなぶ：初心者カリキュラム（構造化TS・MDX不使用）。
// 本文は「ブロック」配列。テキスト中の [[id|表示]] / [[id]] は用語ツールチップ(components/Term)に変換する。
// やさしい(easy)/くわしい(detail) の2版を持つ（生データは平易化しないが、解説層はOK）。
// R-1 では第0部＋第1部を収録。第2部(愛知固有)・第3部(争点実践)は後続で追加。

export type LearnBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "note"; text: string };

export type FigureKey = "tax" | "election" | "nigen";

export interface LearnSource {
  label: string;
  url: string;
}

export interface LearnChapter {
  slug: string;
  part: 0 | 1 | 2 | 3;
  partLabel: string;
  n: string; // 表示番号 例 "1-4"
  title: string;
  lead: string; // 一言の導入
  figure?: FigureKey;
  easy: LearnBlock[];
  detail: LearnBlock[];
  check: string[]; // 「ここまで言えること」
  bridges: { label: string; href: string }[];
  sources?: LearnSource[];
}

export const LEARN: LearnChapter[] = [
  // ───────────── 第0部 動機 ─────────────
  {
    slug: "seiji-towa",
    part: 0,
    partLabel: "第0部 はじめに",
    n: "0",
    title: "そもそも政治とは？",
    lead: "政治＝みんなのお金とルールの決め方。",
    easy: [
      { type: "p", text: "「政治」とむずかしく言うと身構えてしまうけれど、中身はシンプルです。みんなのお金（税金）の集め方と使い方、そしてみんなで守るルールの決め方——これが政治です。" },
      { type: "p", text: "保育園の数、ゴミ収集、道路、学校、水道。あなたの毎日は、ほとんどが政治の決定の上に成り立っています。" },
      { type: "p", text: "だから政治を知ることは、自分の生活がどう決まっているかを知ること。むずかしい言葉は、このサイトでは点線のことばにふれれば、その場で意味が出ます。" },
    ],
    detail: [
      { type: "p", text: "政治とは「限られたお金と権限を、何に・誰に・どれだけ配るか」を決める営みです。集める側のしくみが[[yosan|予算]]や税、配る側が行政サービスにあたります。" },
      { type: "p", text: "決定には立場のちがう2者が関わります。ルールやお金の使い道を決める[[gikai|議会]]（議員）と、実際に行政を動かす[[shucho|首長]]。国では国会と内閣がこれにあたります。" },
      { type: "note", text: "このサイトは「誰に入れるべき」とは言いません。事実と出典だけを示し、判断はあなたに委ねます。" },
    ],
    check: ["政治とは『みんなのお金とルールの決め方』だと言える", "身の回りで政治が決めていることを3つ挙げられる"],
    bridges: [
      { label: "次へ：税金の流れ", href: "/learn/zeikin" },
      { label: "このサイトの約束（中立）", href: "/about" },
    ],
  },

  // ───────────── 第1部 普遍の基礎 ─────────────
  {
    slug: "zeikin",
    part: 1,
    partLabel: "第1部 政治の基礎",
    n: "1-1",
    title: "税金の流れ",
    lead: "集める → 何に使うか決める → 届く、の3ステップ。",
    figure: "tax",
    easy: [
      { type: "p", text: "税金は「みんなの会費」です。お金は3つのステップで動きます。" },
      { type: "list", items: ["① 集める（給料やお店の売上などから税金を集める）", "② 決める（1年でどこにいくら使うかを[[yosan|予算]]として決める）", "③ 届く（保育園・道路・ゴミ収集などのサービスになる）"] },
      { type: "p", text: "②の「決める」が政治の中心です。同じお金でも、何に使うかで暮らしが変わります。" },
    ],
    detail: [
      { type: "p", text: "税には国に納める国税（所得税・消費税など）と、地方に納める地方税（住民税・固定資産税など）があります。地方税は、あなたの街のサービスの財源になります。" },
      { type: "p", text: "使い道は[[gikai|議会]]が[[yosan|予算]]として議決します。だから「税が高い/安い」だけでなく「何に使うか」を見ることが大切です。名古屋市の[[genzei|市民税減税]]は、この“集めると使うのバランス”を考える格好の教材です（第2部）。" },
    ],
    check: ["税金は『集める→決める→届く』の3段で動くと言える", "国税と地方税のちがいをざっくり言える"],
    bridges: [{ label: "次へ：選挙のしくみ", href: "/learn/senkyo" }],
  },
  {
    slug: "senkyo",
    part: 1,
    partLabel: "第1部 政治の基礎",
    n: "1-2",
    title: "選挙のしくみ",
    lead: "代表を選ぶ方法。大きく2つのルールがある。",
    figure: "election",
    easy: [
      { type: "p", text: "選挙は、わたしたちの代表を選ぶ方法です。選び方には大きく2種類あります。" },
      { type: "list", items: ["[[shosenkyoku|小選挙区]]：1つの区から1人だけを選ぶ。いちばん多く票を取った人が当選。", "[[hirei|比例代表]]：政党の得票数に応じて議席を配る。人より“政党”を選ぶ感覚。"] },
      { type: "p", text: "国会議員の選挙では、この2つを組み合わせて使います。" },
    ],
    detail: [
      { type: "p", text: "[[shuin|衆議院]]は「小選挙区＋比例代表」の並立制。愛知は小選挙区が1〜16区、比例は東海ブロックです。[[sangin|参議院]]は「選挙区＋比例代表」で、愛知県選挙区から複数名が選ばれます。" },
      { type: "p", text: "投票率はこの仕組みの“参加度”を映します。仕組みを知ると、自分の1票がどこに効くのかが見えてきます。" },
    ],
    check: ["小選挙区と比例代表のちがいを一言で言える", "衆院と参院で選び方が違うと言える"],
    bridges: [{ label: "次へ：国会と地方議会のちがい", href: "/learn/kokkai-to-chiho" }],
    sources: [
      { label: "総務省「私たちが拓く日本の未来」（主権者教育 副教材）", url: "https://www.soumu.go.jp/senkyo/senkyo_s/news/senkyo/senkyo_nenrei/01.html" },
    ],
  },
  {
    slug: "kokkai-to-chiho",
    part: 1,
    partLabel: "第1部 政治の基礎",
    n: "1-3",
    title: "国会と地方議会のちがい",
    lead: "国は国全体のルール。地方は自分の街のルール。",
    easy: [
      { type: "p", text: "[[kokkai|国会]]は、国全体のルール（法律）と国のお金を決める場所です。" },
      { type: "p", text: "地方議会（愛知県議会や市町村議会）は、自分の街だけのルール（[[jorei|条例]]）と地方のお金を決めます。" },
      { type: "p", text: "つまり「全国の話」か「自分の街の話」かで、見る場所が変わります。" },
    ],
    detail: [
      { type: "p", text: "法律は国会、[[jorei|条例]]は地方議会。財源も国税と地方税で分かれます。あなたの生活に近い保育・ゴミ・道路の多くは“地方”の話で、国会だけ見ていても分かりません。" },
      { type: "note", text: "このサイトが国（愛知選出）・県・市町村の三層をそろえているのは、この『どの層の話か』を見分けられるようにするためです。" },
    ],
    check: ["法律は国会、条例は地方議会が決めると言える", "保育やゴミは“地方”の話だと判断できる"],
    bridges: [{ label: "次へ：二元代表制（背骨）", href: "/learn/nigen-daihyo" }],
  },
  {
    slug: "nigen-daihyo",
    part: 1,
    partLabel: "第1部 政治の基礎",
    n: "1-4",
    title: "二元代表制（地方政治の背骨）",
    lead: "首長と議会を、住民が“別々に”直接選ぶ。",
    figure: "nigen",
    easy: [
      { type: "p", text: "地方では、街のトップ（[[shucho|首長]]＝知事・市長など）と、[[gikai|議会]]の議員を、住民が“別々に”直接えらびます。これが[[nigen|二元代表制]]です。" },
      { type: "p", text: "2つを別々に選ぶので、首長と議会の考えが食いちがうこともあります。対立はこの仕組みの“仕様”でもあります。" },
    ],
    detail: [
      { type: "p", text: "国の政治（議院内閣制）は、選ばれた議員が首相を選びます。だから与党と首相は基本的に同じ方向。" },
      { type: "p", text: "地方はちがいます。会社にたとえると、社長（首長）と取締役会（議会）を、株主（住民）がそれぞれ別の選挙で選ぶイメージ。だから社長と取締役会が対立しうる。名古屋の河村市政と市議会の対立は、この構造が生んだ実例です（第2部で扱います）。" },
    ],
    check: ["地方は首長と議会を別々に選ぶと言える", "国（議院内閣制）と地方（二元代表制）のちがいを言える", "首長と議会が対立しうる理由を説明できる"],
    bridges: [
      { label: "次へ：会派とは", href: "/learn/kaiha" },
      { label: "愛知の首長を見る", href: "/executives" },
    ],
    sources: [{ label: "二元代表制の解説（政経百科）", url: "https://seikeihyakka.com/article/nigendaihyosei" }],
  },
  {
    slug: "kaiha",
    part: 1,
    partLabel: "第1部 政治の基礎",
    n: "1-5",
    title: "会派とは",
    lead: "議会の中で行動を共にする“チーム”。政党とは別物。",
    easy: [
      { type: "p", text: "[[kaiha|会派]]とは、議会の中で行動を共にする議員のグループです。" },
      { type: "p", text: "[[seito|政党]]と同じこともありますが、複数の政党や無所属が一緒に組むこともあります。学校でいう「クラス（政党）」と「文化祭の実行委（会派）」は別、という感覚です。" },
    ],
    detail: [
      { type: "p", text: "議会では会派の人数が、委員会のポストや発言時間に影響します。だれがどの会派かを見ると、議会の“勢力図”が見えます。" },
      { type: "note", text: "このサイトの議員ページでは所属（会派・政党）を表示します。ただし所属は移動することがあるため、最新は出典でご確認ください。" },
    ],
    check: ["会派と政党が別物だと言える", "会派の人数が議会で意味を持つ理由を言える"],
    bridges: [{ label: "次へ：政治資金とは", href: "/learn/seijishikin" }],
  },
  {
    slug: "seijishikin",
    part: 1,
    partLabel: "第1部 政治の基礎",
    n: "1-6",
    title: "政治資金とは",
    lead: "政治のお金は、報告して公開するのがルール。",
    easy: [
      { type: "p", text: "[[seijishikin|政治資金]]とは、政治家や政治団体のお金の出入りのことです。" },
      { type: "p", text: "みんなのお金を扱う立場なので、収支報告書という“家計簿”を出して公開するのがルール。だれでも確認できます。" },
    ],
    detail: [
      { type: "p", text: "金額の大小だけで良し悪しは決まりません。たとえば「選挙区支部」と「後援会」では団体の性質がちがい、桁も変わります。数字は団体の種類とセットで読むのが大切です。" },
      { type: "note", text: "このサイトの政治資金は収支報告書（出典PDF）からの転記で、価値判断はしていません。事実カードでも『読み方の注意』を必ず添えています。" },
    ],
    check: ["政治資金は報告・公開されると言える", "金額は団体の種類とセットで読むべきだと言える"],
    bridges: [
      { label: "事実カードで実例を見る", href: "/facts" },
      { label: "用語集に戻る", href: "/glossary" },
    ],
  },
];

export function getLearnChapters(): LearnChapter[] {
  return LEARN;
}

export function getLearnChapter(slug: string): LearnChapter | undefined {
  return LEARN.find((c) => c.slug === slug);
}
