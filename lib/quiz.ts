// 「県？市？」クイズ。第2部で学んだ“主語の見分け”を実践する。
// answer は層（国=national / 県=prefectural / 市=municipal）。評価でなく仕組みの理解が目的。

export type QuizLayer = "national" | "prefectural" | "municipal";

export interface QuizQuestion {
  q: string;
  answer: QuizLayer;
  explain: string;
}

export const QUIZ: QuizQuestion[] = [
  {
    q: "ゴミの収集や保育園は、おもにどこの仕事？",
    answer: "municipal",
    explain: "身近な暮らしのサービスは市町村の仕事。あなたの街の議会と首長が決めます。",
  },
  {
    q: "法律をつくるのは、どこ？",
    answer: "national",
    explain: "法律は国会（国）。地方が決めるのは、その地域だけのルール＝条例です。",
  },
  {
    q: "県立高校の運営や、県全体の防災は？",
    answer: "prefectural",
    explain: "県全体にかかわる仕事は県（知事と県議会）。市町村より広い範囲を受け持ちます。",
  },
  {
    q: "名古屋城の天守を木造で復元する計画は？",
    answer: "municipal",
    explain: "名古屋城は名古屋市の事業。文化財・観光で県や国も関わりますが、主語は市です。",
  },
  {
    q: "名古屋市の市民税減税は？",
    answer: "municipal",
    explain: "市民税は市の税金。減税は名古屋市政の看板政策で、市の議会・首長の話です。",
  },
  {
    q: "リニア中央新幹線そのもの（路線をつくる事業）は？",
    answer: "national",
    explain: "事業はJR東海と国の認可。一方で名古屋駅まわりのまちづくりは市・県、と層が分かれます。",
  },
];

export const QUIZ_LAYER_LABEL: Record<QuizLayer, string> = {
  national: "国",
  prefectural: "県",
  municipal: "市",
};
