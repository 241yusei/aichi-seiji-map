import type { ReactNode } from "react";
import { Term } from "./Term";
import type { LearnBlock } from "@/lib/learn";

// 本文テキストの [[id|表示]] / [[id]] を用語ツールチップに変換する。
function parseInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [id, label] = m[1].split("|");
    out.push(
      <Term key={key++} id={id}>
        {label}
      </Term>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Blocks({ blocks }: { blocks: LearnBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        if (b.type === "h") {
          return (
            <h3 key={i} className="font-display pt-2 text-xl">
              {parseInline(b.text)}
            </h3>
          );
        }
        if (b.type === "list") {
          return (
            <ul key={i} className="measure list-disc space-y-1.5 pl-5 text-muted">
              {b.items.map((it, j) => (
                <li key={j}>{parseInline(it)}</li>
              ))}
            </ul>
          );
        }
        if (b.type === "note") {
          return (
            <p
              key={i}
              className="measure border-l-2 border-accent bg-subtle px-4 py-3 text-sm text-muted"
            >
              {parseInline(b.text)}
            </p>
          );
        }
        return (
          <p key={i} className="measure leading-relaxed">
            {parseInline(b.text)}
          </p>
        );
      })}
    </div>
  );
}
