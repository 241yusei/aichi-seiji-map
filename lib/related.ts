// 争点 ⇄ 事実カードの相互関連リンク（ビルド時・決定的に計算）。
// 手動キュレーション（FactCard.relatedIssueIds）を最優先し、
// 足りない分だけ争点キーワード×事実カード本文の機械マッチで補う。
// スコアはタイブレークに id 昇順を使うため、同じデータなら常に同じ結果になる。

import type { FactCard, Issue } from "./types";

const MAX_RELATED = 3;

function normalize(s: string): string {
  return s.normalize("NFKC").toLowerCase();
}

function factCardHaystack(card: FactCard): string {
  return normalize(
    [
      card.title,
      card.hook,
      card.body,
      card.caveat,
      ...(card.points ?? []).flatMap((p) => [p.label, p.value]),
    ].join(" "),
  );
}

// 単なる西暦年（例: "2026"）はほぼ全カードに出現し判別力がないため、キーワードから除外する。
function isTooGeneric(term: string): boolean {
  return /^\d+$/.test(term) || term.length < 2;
}

function issueTerms(issue: Issue): string[] {
  const terms = new Set<string>();
  if (issue.title.trim()) terms.add(issue.title);
  for (const k of issue.keywords ?? []) {
    if (k.trim() && !isTooGeneric(k.trim())) terms.add(k);
  }
  return [...terms].map(normalize);
}

function matchScore(haystack: string, terms: string[]): number {
  let score = 0;
  for (const t of terms) {
    if (t && haystack.includes(t)) score += 1;
  }
  return score;
}

/**
 * 争点 → 関連する事実カード（最大3枚）。
 * FactCard.relatedIssueIds による手動キュレーションを優先し、
 * 残り枠を issue.keywords / issue.title と事実カード本文のキーワードマッチで埋める。
 */
export function getRelatedFactCardsForIssue(issue: Issue, allCards: FactCard[]): FactCard[] {
  const curated = allCards.filter((c) => c.relatedIssueIds?.includes(issue.id));
  if (curated.length >= MAX_RELATED) return curated.slice(0, MAX_RELATED);

  const curatedIds = new Set(curated.map((c) => c.id));
  const terms = issueTerms(issue);
  const matched = allCards
    .filter((c) => !curatedIds.has(c.id))
    .map((c) => ({ card: c, score: matchScore(factCardHaystack(c), terms) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.card.id.localeCompare(b.card.id))
    .map((x) => x.card);

  return [...curated, ...matched].slice(0, MAX_RELATED);
}

/**
 * 事実カード → 関連する争点（最大3件）。
 * FactCard.relatedIssueIds による手動キュレーションを優先し、
 * 残り枠を事実カード本文と issue.keywords / issue.title のキーワードマッチで埋める。
 */
export function getRelatedIssuesForFactCard(card: FactCard, allIssues: Issue[]): Issue[] {
  const curated = allIssues.filter((i) => card.relatedIssueIds?.includes(i.id));
  if (curated.length >= MAX_RELATED) return curated.slice(0, MAX_RELATED);

  const curatedIds = new Set(curated.map((i) => i.id));
  const haystack = factCardHaystack(card);
  const matched = allIssues
    .filter((i) => !curatedIds.has(i.id))
    .map((i) => ({ issue: i, score: matchScore(haystack, issueTerms(i)) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.issue.id.localeCompare(b.issue.id))
    .map((x) => x.issue);

  return [...curated, ...matched].slice(0, MAX_RELATED);
}
