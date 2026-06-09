// 用語集（初心者向け）。文脈内ツールチップ（components/Term）と /glossary が参照する。
// 中立・自作。短定義は1〜2文。固有の評価語は使わない。

export interface GlossaryTerm {
  id: string; // 例: "nigen"
  term: string; // 表示名 例: "二元代表制"
  yomi?: string; // ふりがな
  short: string; // ツールチップ用（1〜2文）
  long?: string; // 用語集ページ用の補足
  seeAlso?: string[]; // 関連語id
}

export const GLOSSARY: GlossaryTerm[] = [
  { id: "shuin", term: "衆議院", yomi: "しゅうぎいん", short: "国会の片方の院で「下院」にあたる。任期4年・解散があり、予算や首相指名で参議院より強い権限を持つ。", seeAlso: ["sangin", "kokkai"] },
  { id: "sangin", term: "参議院", yomi: "さんぎいん", short: "国会のもう片方の院で「上院」にあたる。任期6年・解散がなく、じっくり審議する「良識の府」とも呼ばれる。", seeAlso: ["shuin", "kokkai"] },
  { id: "kokkai", term: "国会", yomi: "こっかい", short: "国の法律や予算を決める場。衆議院と参議院の2つからなる。", seeAlso: ["gikai"] },
  { id: "hirei", term: "比例代表", yomi: "ひれいだいひょう", short: "政党の得票数に応じて議席を配分する仕組み。候補者個人でなく政党を選ぶ（参院は個人名も可）。", seeAlso: ["shosenkyoku"] },
  { id: "shosenkyoku", term: "小選挙区", yomi: "しょうせんきょく", short: "1つの選挙区から1人だけを選ぶ仕組み。最多得票の1人が当選する。", seeAlso: ["hirei", "senkyoku"] },
  { id: "senkyoku", term: "選挙区", yomi: "せんきょく", short: "議員を選ぶ単位となる区域。", seeAlso: ["shosenkyoku"] },
  { id: "saiketsu", term: "採決", yomi: "さいけつ", short: "議案に賛成か反対かを議員が決める手続き。", seeAlso: ["kimei", "kiritsu"] },
  { id: "kimei", term: "記名投票", yomi: "きめいとうひょう", short: "誰が賛成・反対したかが記録・公表される投票方法。参議院の押しボタン式など。", seeAlso: ["kiritsu", "saiketsu"] },
  { id: "kiritsu", term: "起立採決", yomi: "きりつさいけつ", short: "賛成者が起立して数える採決。個人ごとの賛否は公表されない。", seeAlso: ["kimei", "saiketsu"] },
  { id: "seijishikin", term: "政治資金", yomi: "せいじしきん", short: "政治家・政治団体のお金の出入り。収支報告書で公開され、誰でも確認できる。" },
  { id: "kaiha", term: "会派", yomi: "かいは", short: "議会の中で行動を共にする議員のグループ。政党と一致することも、複数政党や無所属が組むこともある。", seeAlso: ["seito"] },
  { id: "seito", term: "政党", yomi: "せいとう", short: "考え方の近い政治家が集まる組織。会派とは別の概念。", seeAlso: ["kaiha"] },
  { id: "shucho", term: "首長", yomi: "しゅちょう", short: "自治体のトップ。知事（県）・市長・町長・村長。議会とは別に住民が直接選ぶ。", seeAlso: ["nigen", "chiji", "gikai"] },
  { id: "seireishi", term: "政令指定都市", yomi: "せいれいしていとし", short: "人口50万以上で国が指定した大きな市。県並みの権限を一部持つ。愛知では名古屋市が該当。", seeAlso: ["shucho"] },
  { id: "nigen", term: "二元代表制", yomi: "にげんだいひょうせい", short: "地方政治のしくみ。首長と議会の議員を住民がそれぞれ別に直接選ぶため、両者が対立することもある。", long: "国の政治（議院内閣制）は議員が首相を選ぶが、地方は首長（社長役）と議会（取締役会）を住民（株主）が別々に選ぶ。だから構造的に対立しうる。", seeAlso: ["shucho", "gikai"] },
  { id: "jorei", term: "条例", yomi: "じょうれい", short: "自治体が定める、その地域だけのルール（法律の地方版）。", seeAlso: ["gikai"] },
  { id: "yosan", term: "予算", yomi: "よさん", short: "1年間にどこへいくらお金を使うかの計画。", seeAlso: ["jorei"] },
  { id: "chiji", term: "知事", yomi: "ちじ", short: "都道府県のトップ。県全体の行政を率いる。", seeAlso: ["shucho"] },
  { id: "gikai", term: "議会", yomi: "ぎかい", short: "住民が選んだ議員が、条例や予算を決める場。", seeAlso: ["shucho", "nigen"] },
  { id: "genzei", term: "市民税減税", yomi: "しみんぜいげんぜい", short: "名古屋市が全国で唯一続ける、市民税の恒久的な引き下げ。家計の負担減と行政サービスの財源がトレードオフになる。", seeAlso: ["yosan"] },
];

export function glossaryTerm(id: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.id === id);
}
