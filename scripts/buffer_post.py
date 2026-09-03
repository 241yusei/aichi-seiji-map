#!/usr/bin/env python3
"""
政治のトリセツ Buffer 自動投稿スクリプト（新GraphQL API: https://api.buffer.com）

設計方針:
  - 投稿は mode=customScheduled / schedulingType=automatic で「指定時刻に自動公開」を予約。
    公開前は Buffer ダッシュボードのキューに並び、目視・編集・取消できる。
  - 中身は3カテゴリを1日5本: アプリ機能×1・事実カード×3・開発の裏側×1。
  - 投稿先は検証済みの「政治のトリセツ」X / Threads チャンネルのみ。誤爆防止に毎回チャンネル名を照合。
  - 中立・非投票誘導・一次ソースつきを厳守。評価語は使わない。

使い方:
  python3 scripts/buffer_post.py --mode channels             # 接続チャンネル確認（読み取り）
  python3 scripts/buffer_post.py --mode preview               # 今日の5本を生成して表示（ネットワーク不要）
  python3 scripts/buffer_post.py --mode schema                # GraphQL introspect（デバッグ用）
  python3 scripts/buffer_post.py --mode queue --confirm       # Bufferキューに予約（--confirm 必須）

APIキーは .env の BUFFER_API_KEY に置く（.gitignore済み・チャットや公開リポジトリに貼らない）。
"""

import os
import sys
import json
import argparse
import logging
from datetime import datetime, date, timedelta, timezone
from pathlib import Path

# ─── パス設定 ────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "data"
FACT_CARDS_FILE = DATA_DIR / "fact-cards.json"
CONTENT_FILE = DATA_DIR / "sns_content.json"
ELECTION_FILE = DATA_DIR / "election-windows.json"
STATE_FILE = DATA_DIR / ".buffer_state.json"
LOG_FILE = PROJECT_DIR / "logs" / "buffer_post.log"

SITE = "https://aichi-seiji-map.vercel.app"

# ─── ログ設定 ────────────────────────────────────────────────
LOG_FILE.parent.mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger(__name__)

# ─── 環境変数 ────────────────────────────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv(PROJECT_DIR / ".env")
except ImportError:
    log.warning("python-dotenv 未導入。pip install python-dotenv を実行してください。")

BUFFER_API_KEY = os.environ.get("BUFFER_API_KEY", "").strip()
BUFFER_CHANNEL_IDS = [
    c.strip() for c in os.environ.get("BUFFER_CHANNEL_IDS", "").split(",") if c.strip()
]
BUFFER_ENDPOINT = "https://api.buffer.com"

# 「政治のトリセツ」だと判定する識別子（誤爆防止のチャンネル照合）。
ACCOUNT_MARKERS = ["seiji_torisetsu", "seiji.torisetsu", "政治のトリセツ"]

# ─── Buffer GraphQL（introspect で確定済み）─────────────────
CREATE_POST_MUTATION = """
mutation Create($input: CreatePostInput!) {
  createPost(input: $input) {
    __typename
    ... on PostActionSuccess { post { id } }
    ... on NotFoundError { message }
    ... on UnauthorizedError { message }
    ... on UnexpectedError { message }
    ... on RestProxyError { message code }
    ... on LimitReachedError { message }
    ... on InvalidInputError { message }
  }
}
"""


def create_post_vars(
    channel_id: str,
    text: str,
    scheduled_iso: str,
    service: str = "",
    image_url: str | None = None,
    reply_text: str | None = None,
    topic: str | None = None,
) -> dict:
    # mode=customScheduled + dueAt で指定時刻に予約、schedulingType=automatic で自動公開。
    assets = [{"image": {"url": image_url}}] if image_url else []
    inp = {
        "channelId": channel_id,
        "text": text,
        "schedulingType": "automatic",
        "mode": "customScheduled",
        "dueAt": scheduled_iso,
        "assets": assets,
        "saveToDraft": False,
    }
    # metadata（サービス別）：
    #   X   → thread に「自己リプ」を付ける。本体はリンクなしで最大リーチ、出典URLは自己リプで担保。
    #         （Buffer schema 実測：TwitterPostMetadataInput.thread: [ThreadedPostInput!]、
    #          ThreadedPostInput{text, assets:[AssetInput!]!}）
    #   Threads → topic（単一トピックタグ）を付ける。リンクは本文併記（Mosseri公認）。
    meta: dict = {}
    if service == "twitter" and reply_text:
        meta["twitter"] = {"thread": [{"text": reply_text, "assets": []}]}
    if service == "threads" and topic:
        meta["threads"] = {"topic": topic}
    if meta:
        inp["metadata"] = meta
    return {"input": inp}


# ─── GraphQL ヘルパ ──────────────────────────────────────────
def gql(query: str, variables: dict | None = None) -> dict:
    import requests as req

    if not BUFFER_API_KEY:
        log.error("BUFFER_API_KEY が未設定です。.env に記入してください。")
        sys.exit(1)
    r = req.post(
        BUFFER_ENDPOINT,
        headers={"Authorization": f"Bearer {BUFFER_API_KEY}", "Content-Type": "application/json"},
        json={"query": query, "variables": variables or {}},
        timeout=20,
    )
    try:
        data = r.json()
    except Exception:
        log.error(f"JSON以外の応答 (HTTP {r.status_code}): {r.text[:500]}")
        sys.exit(1)
    if "errors" in data:
        log.error(f"GraphQL エラー: {json.dumps(data['errors'], ensure_ascii=False)[:800]}")
    return data


# ─── アカウント / チャンネル ────────────────────────────────
def get_org_id() -> str | None:
    d = gql("{ account { name organizations { id name } } }")
    acct = (d.get("data") or {}).get("account") or {}
    orgs = acct.get("organizations") or []
    return orgs[0]["id"] if orgs else None


def fetch_channels() -> list[dict]:
    oid = get_org_id()
    if not oid:
        log.error("organizationId を取得できません。APIキーを確認してください。")
        return []
    q = "query($i: ChannelsInput!){ channels(input: $i){ id name displayName service type isDisconnected } }"
    d = gql(q, {"i": {"organizationId": oid}})
    return (d.get("data") or {}).get("channels") or []


def is_ours(ch: dict) -> bool:
    blob = json.dumps(ch, ensure_ascii=False).lower()
    return any(m.lower() in blob for m in ACCOUNT_MARKERS)


def mode_channels() -> list[dict]:
    channels = fetch_channels()
    log.info(f"=== 接続チャンネル {len(channels)}件 ===")
    matched = []
    for c in channels:
        flag = "✅" if (is_ours(c) and not c.get("isDisconnected")) else "  "
        log.info(f"  {flag} {c.get('service')} / {c.get('displayName')} / id={c.get('id')} / 接続={'切' if c.get('isDisconnected') else '済'}")
        if is_ours(c) and not c.get("isDisconnected"):
            matched.append(c)
    if not matched:
        log.warning("⚠️ 『政治のトリセツ』の有効チャンネルが見つかりません。投稿は中止すべきです。")
    return matched


# ─── 投稿コンテンツの生成 ────────────────────────────────────
# リーチ最大化仕様（sns_strategy.md §1・§1' 準拠。すべて一次情報で裏取り済みの原則のみ）：
#   X   = 本体はリンクなしで完結（リンク付きはリーチが下がる＝Bier 2025-10）。
#         出典URLは「自己リプ（thread）」で担保 → 本体の最大リーチとサイト到達(最重要KPI)を両立。
#   Threads = リンクは本文併記（Mosseri公認で不利なし）＋単一トピックタグ。
#   画像 = 事実カードのOGP画像（/facts/{id}/opengraph-image）を両媒体に添付（画像付きは強い）。
#   会話 = Threadsは「自分の地域を調べる」中立CTAで返信・プロフィールクリックを誘発（返信は最重要シグナル）。
#   タグ = 1個に統一（Xは #政治のトリセツ、Threadsは topic）。

# Threads末尾の中立エンゲージCTA（返信・回遊を誘発。評価語・投票誘導は含めない）。
# kokkaimap の拡散核＝「郵便番号で自分の代表」パーソナライズ導線に倣う。決定的にローテーション。
THREADS_PROMPTS = [
    "あなたの地域の代表は誰か、郵便番号で調べられます（プロフィールのリンクから）。",
    "他の採決・発言も、同じように一次ソース付きで並べて確認できます。",
    "気になる論点があれば、争点ページから国・県・市を横断で追えます。",
]

THREADS_TOPIC = "政治"  # Threadsの単一トピックタグ


def _x_source_reply(label: str, url: str) -> str:
    # X本体はリンクなし。全文と一次ソース（{label}）への入口は自己リプに置く。
    return f"全文と一次ソース（{label}）はこちら：\n{url}"


def _fact_card_post(card: dict) -> dict:
    source_label = (card.get("sources") or [{}])[0].get("label", "一次ソース")
    base = f"{card['title']}\n{card.get('hook','')}"
    url = f"{SITE}/facts/{card['id']}/"
    return {
        "category": "fact",
        "text_x": f"{base}\n#政治のトリセツ",       # リンクなし本体
        "x_reply": _x_source_reply(source_label, url),  # 出典URLは自己リプ
        "text_threads": f"{base}",                  # タグは topic で付与
        "url": url,
        "image_url": f"{SITE}/facts/{card['id']}/opengraph-image",
    }


def _pool_post(item: dict, category: str) -> dict:
    base = item["text"]
    url = item["url"]
    return {
        "category": category,
        "text_x": f"{base}\n#政治のトリセツ",       # リンクなし本体
        "x_reply": f"詳しくはこちら：\n{url}",        # リンクは自己リプ
        "text_threads": f"{base}",
        "url": url,
        "image_url": None,
    }


def build_today_posts(target: date) -> list[dict]:
    """その日の5本を決定的に生成（機能×1・事実×3・裏側×1）。再実行しても同じ結果。"""
    facts = json.loads(FACT_CARDS_FILE.read_text(encoding="utf-8"))
    pools = json.loads(CONTENT_FILE.read_text(encoding="utf-8"))
    dev, feat = pools["dev_backstory"], pools["app_feature"]

    base = target.toordinal()
    fc = [_fact_card_post(facts[(base + k) % len(facts)]) for k in range(3)]
    feature = _pool_post(feat[base % len(feat)], "feature")
    backstory = _pool_post(dev[base % len(dev)], "backstory")

    # アルゴリズム的に有効なJSTの時間帯（通勤・昼・通勤・プライム・プライム）。
    slots = ["07:30", "12:15", "18:30", "21:00", "22:30"]
    ordered = [feature, fc[0], fc[1], backstory, fc[2]]
    posts = []
    for i, (s, p) in enumerate(zip(slots, ordered)):
        # Threads末尾に中立エンゲージCTAを決定的にローテーションで付ける。
        prompt = THREADS_PROMPTS[(base + i) % len(THREADS_PROMPTS)]
        posts.append({**p, "slot": s, "threads_prompt": prompt, "topic": THREADS_TOPIC})
    return posts


def _jst_iso(target: date, hhmm: str) -> str:
    h, m = map(int, hhmm.split(":"))
    jst = timezone(timedelta(hours=9))
    return datetime(target.year, target.month, target.day, h, m, tzinfo=jst).isoformat()


def mode_preview(target: date):
    posts = build_today_posts(target)
    log.info(f"=== {target} の予定 5本（プレビュー・未投稿）===")
    for i, p in enumerate(posts, 1):
        log.info(f"--- [{i}] {p['slot']} JST / {p['category']} ---")
        log.info(f"[X 本体・リンクなし] {p['text_x']}")
        log.info(f"[X 自己リプ] {p['x_reply']}")
        threads_body = f"{p['text_threads']}\n\n{p['url']}\n\n{p['threads_prompt']}"
        log.info(f"[Threads / topic={p['topic']}] {threads_body}")
        if p["image_url"]:
            log.info(f"  ↳ 画像添付(両媒体): {p['image_url']}")


# ─── 選挙期ガード ────────────────────────────────────────────
def in_election_period(target: date) -> bool:
    if not ELECTION_FILE.exists():
        return False
    try:
        windows = json.loads(ELECTION_FILE.read_text(encoding="utf-8"))
    except Exception:
        return False
    iso = target.isoformat()
    rows = windows if isinstance(windows, list) else windows.get("windows", [])
    for w in rows:
        # サイト側スキーマ（lib/election-window.ts）は from/until。旧 start/end も受ける。
        start = w.get("from") or w.get("start")
        end = w.get("until") or w.get("end")
        if start and end and start <= iso <= end:
            log.warning(f"選挙期ガード作動: {w.get('name','選挙期間')}（{start}〜{end}）。自動投稿を中止します。")
            return True
    return False


# ─── キューに予約 ────────────────────────────────────────────
def mode_queue(target: date, confirm: bool):
    if not confirm:
        log.error("安全のため queue は --confirm 必須です。先に preview / channels で確認してください。")
        sys.exit(1)
    if in_election_period(target):
        sys.exit(0)
    # 二重投稿ガード: 同じ対象日を既に予約済みなら再実行しても何もしない。
    if STATE_FILE.exists():
        try:
            prev = json.loads(STATE_FILE.read_text(encoding="utf-8"))
            if prev.get("date") == target.isoformat() and any(r.get("ok") for r in prev.get("results", [])):
                log.info(f"{target} は既にキュー予約済みです。重複を避けるためスキップします。")
                sys.exit(0)
        except Exception:
            pass

    matched = mode_channels()
    if not matched:
        log.error("有効な『政治のトリセツ』チャンネルが無いため投稿を中止します。")
        sys.exit(1)
    if BUFFER_CHANNEL_IDS:
        target_channels = [c for c in matched if c["id"] in BUFFER_CHANNEL_IDS]
    else:
        target_channels = matched

    posts = build_today_posts(target)
    results = []
    for p in posts:
        scheduled = _jst_iso(target, p["slot"])
        for ch in target_channels:
            svc = ch["service"]
            # X: 本体リンクなし＋出典URLは自己リプ。Threads: 本文にリンク併記＋単一トピック＋中立CTA。
            if svc == "twitter":
                body = p["text_x"]
                variables = create_post_vars(
                    ch["id"], body, scheduled, service="twitter",
                    image_url=p["image_url"], reply_text=p["x_reply"],
                )
            else:
                body = f"{p['text_threads']}\n\n{p['url']}\n\n{p['threads_prompt']}"
                variables = create_post_vars(
                    ch["id"], body, scheduled, service="threads",
                    image_url=p["image_url"], topic=p.get("topic"),
                )
            data = gql(CREATE_POST_MUTATION, variables)
            payload = (data.get("data") or {}).get("createPost") or {}
            ok = payload.get("__typename") == "PostActionSuccess"
            # 自己修復フォールバック：metadata（自己リプ/トピック）が拒否されたら、
            # metadataを外して本文のみで再試行し、投稿の欠落（＝リーチ損失）を防ぐ。
            if not ok and "metadata" in variables["input"]:
                log.warning(f"  ↳ metadata付き投稿が拒否されたためメタなしで再試行: {p['slot']} [{svc}]")
                fb = create_post_vars(ch["id"], body, scheduled, image_url=p["image_url"])
                data = gql(CREATE_POST_MUTATION, fb)
                payload = (data.get("data") or {}).get("createPost") or {}
                ok = payload.get("__typename") == "PostActionSuccess"
            detail = payload.get("post", {}).get("id") if ok else (payload.get("message") or data.get("errors"))
            results.append({"slot": p["slot"], "service": svc, "ok": ok, "detail": detail})
            log.info(f"{'✅' if ok else '❌'} {p['slot']} JST [{svc}] {p['category']} → {detail}")

    STATE_FILE.write_text(
        json.dumps({"date": target.isoformat(), "results": results}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    n_ok = sum(1 for r in results if r["ok"])
    log.info(f"完了: {n_ok}/{len(results)} 件をキューに予約")


# ─── スキーマ確認（デバッグ）─────────────────────────────────
def mode_schema():
    q = "{ __schema { mutationType { fields { name } } queryType { fields { name } } } }"
    log.info(json.dumps(gql(q), ensure_ascii=False)[:1500])


# ─── メイン ──────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(description="政治のトリセツ Buffer 自動投稿")
    ap.add_argument("--mode", choices=["schema", "channels", "preview", "queue"], required=True)
    ap.add_argument("--confirm", action="store_true", help="queue 実行に必須の安全フラグ")
    ap.add_argument("--date", help="対象日 YYYY-MM-DD（省略時は今日）")
    args = ap.parse_args()

    target = date.fromisoformat(args.date) if args.date else date.today()

    if args.mode == "schema":
        mode_schema()
    elif args.mode == "channels":
        mode_channels()
    elif args.mode == "preview":
        mode_preview(target)
    elif args.mode == "queue":
        mode_queue(target, args.confirm)


if __name__ == "__main__":
    main()
