/** キーワードの周辺を原文のまま切り出す。要約・主題の判定はしない。 */
export function speechKeywordContext(text: string, keywords: string[]) {
  const matched = keywords.filter((word) => word !== "" && text.includes(word));
  if (!matched.length) return null;
  const first = Math.min(...matched.map((word) => text.indexOf(word)));
  const previousEnd = text.lastIndexOf("。", first);
  const previousStart = previousEnd < 0 ? 0 : text.lastIndexOf("。", previousEnd - 1) + 1;
  // 短い直前の一文も残し、該当語だけの切り抜きにならないようにする。
  const minimumStart = Math.max(0, first - 140);
  const start = previousStart >= minimumStart ? previousStart
    : previousEnd >= minimumStart ? previousEnd + 1 : minimumStart;
  let end = Math.min(text.length, start + 300);
  if (end < text.length) {
    const sentenceEnd = text.lastIndexOf("。", end - 1);
    if (sentenceEnd > first) end = sentenceEnd + 1;
  }
  return { matched, text: text.slice(start, end).trim(), before: start > 0, after: end < text.length };
}

/** 一致語を文字列として扱う。正規表現やHTMLへの展開は行わない。 */
export function keywordParts(text: string, keywords: string[]) {
  const parts: { text: string; matched: boolean }[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const next = keywords.filter(Boolean).map((word) => ({ word, at: text.indexOf(word, cursor) }))
      .filter((item) => item.at >= 0).sort((a, b) => a.at - b.at || b.word.length - a.word.length)[0];
    if (!next) { parts.push({ text: text.slice(cursor), matched: false }); break; }
    if (next.at > cursor) parts.push({ text: text.slice(cursor, next.at), matched: false });
    parts.push({ text: next.word, matched: true });
    cursor = next.at + next.word.length;
  }
  return parts;
}
