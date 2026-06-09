"use client";

import { useState } from "react";
import Link from "next/link";
import { QUIZ, QUIZ_LAYER_LABEL, type QuizLayer } from "@/lib/quiz";

// 「県？市？」クイズ。主語の見分けを練習する。評価でなく理解が目的。
export function KenshiQuiz() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<QuizLayer | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const total = QUIZ.length;
  const cur = QUIZ[i];

  function pick(l: QuizLayer) {
    if (picked) return;
    setPicked(l);
    if (l === cur.answer) setScore((s) => s + 1);
  }

  function next() {
    if (i + 1 >= total) {
      setDone(true);
      try {
        localStorage.setItem("quiz-done", "1");
      } catch {
        // 保存できなくても結果表示は継続
      }
      return;
    }
    setI((x) => x + 1);
    setPicked(null);
  }

  function restart() {
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }

  if (done) {
    return (
      <div className="border border-ink bg-surface p-6 text-center">
        <p className="eyebrow text-accent-deep">けっか</p>
        <p className="font-display tnum mt-2 text-4xl">
          {score} <span className="text-xl text-muted">/ {total}</span>
        </p>
        <p className="mt-3 text-sm text-muted">
          大切なのは点数より「県の話か、市の話か、国の話か」を見分ける力。
          実際の争点で試してみましょう。
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={restart}
            className="border border-ink px-4 py-2 text-sm font-bold transition-colors hover:bg-subtle"
          >
            もう一度
          </button>
          <Link
            href="/issues/"
            className="bg-ink px-4 py-2 text-sm font-bold text-paper transition-colors hover:bg-accent"
          >
            争点で実践する →
          </Link>
        </div>
      </div>
    );
  }

  const correct = picked === cur.answer;

  return (
    <div className="border border-ink bg-surface p-6">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow text-faint">
          問題 {i + 1} / {total}
        </p>
        <p className="eyebrow tnum text-faint">スコア {score}</p>
      </div>
      <p className="font-display mt-3 text-lg leading-snug">{cur.q}</p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {(["national", "prefectural", "municipal"] as QuizLayer[]).map((l) => {
          const isAns = l === cur.answer;
          const isPicked = picked === l;
          let cls = "border-ink hover:bg-subtle";
          if (picked) {
            if (isAns) cls = "border-yea bg-yea/10 text-yea";
            else if (isPicked) cls = "border-nay bg-nay/10 text-nay";
            else cls = "border-line text-faint";
          }
          return (
            <button
              key={l}
              type="button"
              onClick={() => pick(l)}
              disabled={!!picked}
              className={`font-display border px-3 py-3 text-lg transition-colors ${cls}`}
            >
              {QUIZ_LAYER_LABEL[l]}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="mt-4 border-l-2 border-accent bg-subtle px-4 py-3">
          <p className="text-sm font-bold text-ink">
            {correct ? "正解！" : `正解は「${QUIZ_LAYER_LABEL[cur.answer]}」`}
          </p>
          <p className="measure mt-1 text-sm text-muted">{cur.explain}</p>
          <button
            type="button"
            onClick={next}
            className="mt-3 bg-ink px-4 py-2 text-sm font-bold text-paper transition-colors hover:bg-accent"
          >
            {i + 1 >= total ? "結果を見る" : "次へ →"}
          </button>
        </div>
      )}
    </div>
  );
}
