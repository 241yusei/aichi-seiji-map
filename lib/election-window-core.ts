// 選挙期間の判定ロジック（純粋関数・fs 不使用）。
// サーバー（ビルド時）とブラウザ（閲覧時）の両方から呼べるよう、読み込み処理とは分離している。

export interface ElectionWindow {
  name: string; // 例: "弥富市長選挙"
  from: string; // 告示日 ISO (YYYY-MM-DD)
  until: string; // 投票日 ISO (YYYY-MM-DD)
}

/** 日本時間(JST)の「今日」を YYYY-MM-DD で返す。
 * toISOString() は UTC のため、JST 00:00〜09:00 には前日を返してしまう。
 * 告示日当日の朝に判定が外れないよう、必ず JST で判定する。 */
export function todayJst(now: number = Date.now()): string {
  return new Date(now + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** 指定日が期間内（告示日〜投票日）の選挙をすべて返す。同日に複数の選挙がありうる。 */
export function findActiveWindows(windows: ElectionWindow[], dateIso: string): ElectionWindow[] {
  return windows.filter((w) => w.from <= dateIso && dateIso <= w.until);
}
