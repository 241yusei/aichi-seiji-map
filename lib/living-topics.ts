import { getLivingTopics } from "./data";
import type { LivingTopicBriefData } from "./types";

/** 生活テーマと具体案件を結ぶ。収録のない争点では通常の解説を表示する。 */
export function getLivingTopicByIssue(issueId: string): LivingTopicBriefData | undefined {
  return getLivingTopics().find((topic) => topic.issueId === issueId);
}
