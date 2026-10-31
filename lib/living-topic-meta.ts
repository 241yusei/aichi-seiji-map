import type { LivingTopicBriefData } from "./types";

/** 検索・共有時にも対象地域と資料の時点を落とさない。確認日を現在日に置き換えない。 */
export function livingTopicMetadata(topic: LivingTopicBriefData) {
  const title = topic.pageTitle;
  const description = `${topic.caseTitle}。解説の確認日：${topic.confirmedAt}。対象地域：${topic.region.text} ${topic.period.text} 公式出典・未確認事項を掲載。`;
  return { title, description, openGraph: { title, description } };
}
