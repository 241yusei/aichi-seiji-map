import type { Issue, SpeechRecord } from "../../lib/types";

export interface IssueSeed {
  id: string;
  title: string;
  description: string;
  keywords: string[];
}

/** 候補を作るだけで、公開中の紐付けは変更しない。語の一致は関連性の証明ではない。 */
export function buildIssueCandidates(
  seeds: readonly IssueSeed[],
  published: readonly Issue[],
  speeches: readonly SpeechRecord[],
  limit = 15,
) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error("候補上限は正の整数が必要です");
  function uniqueIds(rows: readonly { id: string }[], label: string) {
    const ids = new Set(rows.map((row) => row.id));
    if (ids.size !== rows.length) throw new Error(`${label}に重複IDがあります`);
    return ids;
  }
  const seedIds = uniqueIds(seeds, "争点seed");
  const publishedIds = uniqueIds(published, "公開争点");
  const speechIds = uniqueIds(speeches, "発言");
  for (const id of seedIds) {
    if (!publishedIds.has(id)) throw new Error(`公開争点にないID: ${id}`);
  }
  for (const issue of published) {
    if (!seedIds.has(issue.id)) throw new Error(`seedにない公開争点ID: ${issue.id}`);
    if (new Set(issue.relatedSpeechIds).size !== issue.relatedSpeechIds.length) {
      throw new Error(`公開紐付けに重複IDがあります: ${issue.id}`);
    }
    for (const id of issue.relatedSpeechIds) {
      if (!speechIds.has(id)) throw new Error(`公開紐付けの参照先発言が不明: ${issue.id} → ${id}`);
    }
  }
  const byId = new Map(published.map((issue) => [issue.id, issue]));
  return seeds.map((seed) => {
    const publishedSpeechIds = [...byId.get(seed.id)!.relatedSpeechIds];
    const linked = new Set(publishedSpeechIds);
    const matched = speeches
      .filter((speech) => !linked.has(speech.id))
      .map((speech) => ({
        speech,
        matchedKeywords: seed.keywords.filter((word) => word.length > 0 &&
          (speech.text.includes(word) || speech.body.includes(word))),
      }))
      .filter((match) => match.matchedKeywords.length > 0)
      .sort((a, b) => b.speech.date.localeCompare(a.speech.date) || a.speech.id.localeCompare(b.speech.id));
    return {
      issueId: seed.id,
      title: seed.title,
      publishedSpeechIds,
      unmatchedReviewCount: matched.length,
      candidates: matched.slice(0, limit).map(({ speech, matchedKeywords }) => ({
        status: "unreviewed" as const,
        reason: "キーワード一致のみ。一般語単体の一致も含み、争点との関連性は未確認。公開前に原文確認が必要。",
        matchedKeywords,
        speechId: speech.id,
        legislatorId: speech.legislatorId,
        date: speech.date,
        body: speech.body,
        text: speech.text,
        sourceUrl: speech.sourceUrl,
        isExcerpt: speech.isExcerpt ?? false,
      })),
    };
  });
}
