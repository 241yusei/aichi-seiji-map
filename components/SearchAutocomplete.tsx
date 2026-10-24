"use client";

import { useEffect, useLayoutEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import type { SearchEntry } from "@/lib/search-index";

const keyFor = (entry: SearchEntry) => `${entry.u}:${entry.t}`;

export function SearchAutocomplete({ query, onChange, suggestions, onChoose, inputRef, children }: {
  query: string;
  onChange: (value: string) => void;
  suggestions: SearchEntry[];
  onChoose: (entry: SearchEntry) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  children: ReactNode;
}) {
  const id = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const composingRef = useRef(false);
  const [composing, setComposing] = useState(false);
  const [focused, setFocused] = useState(false);
  const [openQuery, setOpenQuery] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [popup, setPopup] = useState({ above: false, height: 240 });
  const open = focused && !composing && openQuery === query && suggestions.length > 0;
  const active = open ? suggestions.findIndex((entry) => keyFor(entry) === activeKey) : -1;

  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const headerBottom = Math.max(0, document.querySelector("header")?.getBoundingClientRect().bottom ?? 0);
      const above = Math.max(0, rect.top - headerBottom - 12);
      const below = Math.max(0, (window.visualViewport?.height ?? window.innerHeight) - rect.bottom - (window.innerWidth < 1024 ? 96 : 16));
      const next = { above: above > below, height: Math.max(80, Math.min(320, Math.max(above, below))) };
      setPopup((current) => current.above === next.above && current.height === next.height ? current : next);
    };
    // DOM計測は初回paint前に行い、候補が操作ボタンや画面外を覆わないようにする。
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [open]);

  useEffect(() => {
    if (active >= 0) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function choose(entry: SearchEntry) {
    setOpenQuery(null);
    setActiveKey(null);
    onChoose(entry);
  }

  return (
    <div ref={anchorRef} className="relative">
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-label="検索"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-activedescendant={active >= 0 ? `${id}-option-${active}` : undefined}
        aria-describedby={`${id}-help`}
        autoComplete="off"
        autoFocus
        value={query}
        onChange={(event) => {
          setFocused(true);
          setOpenQuery(event.target.value);
          setActiveKey(null);
          onChange(event.target.value);
        }}
        onFocus={() => { setFocused(true); setOpenQuery(query); setActiveKey(null); }}
        onBlur={(event) => {
          if (!listRef.current?.contains(event.relatedTarget)) { setFocused(false); setActiveKey(null); }
        }}
        onCompositionStart={() => { composingRef.current = true; setComposing(true); setActiveKey(null); }}
        onCompositionEnd={(event) => {
          composingRef.current = false;
          setComposing(false);
          setOpenQuery(event.currentTarget.value);
          onChange(event.currentTarget.value);
        }}
        onKeyDown={(event) => {
          if (composingRef.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
          if ((event.key === "ArrowDown" || event.key === "ArrowUp") && query.trim()) {
            event.preventDefault();
            setFocused(true);
            setOpenQuery(query);
            if (!suggestions.length) { setActiveKey(null); return; }
            const next = event.key === "ArrowDown"
              ? (active + 1) % suggestions.length
              : (active < 0 ? suggestions.length - 1 : (active - 1 + suggestions.length) % suggestions.length);
            setActiveKey(keyFor(suggestions[next]));
          } else if (event.key === "Enter" && active >= 0) {
            event.preventDefault();
            choose(suggestions[active]);
          } else if (event.key === "Escape") {
            event.preventDefault();
            setOpenQuery(null);
            setActiveKey(null);
          }
        }}
        placeholder="議員名・地域・政党・争点で検索"
        className="w-full border border-ink bg-surface px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <p id={`${id}-help`} className="mt-2 text-xs text-muted">
        入力すると最大6件の候補を表示。上下キーで選び、Enterでページを開けます。
      </p>
      {children}
      {open && (
        <div
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-label="検索候補"
          style={{ maxHeight: popup.height }}
          className={`ui-reveal absolute inset-x-0 z-20 overflow-auto rounded-xl border border-field bg-paper shadow-sm ${popup.above ? "bottom-full mb-1" : "top-full mt-1"}`}
        >
          {suggestions.map((entry, i) => (
            <button
              key={keyFor(entry)}
              id={`${id}-option-${i}`}
              role="option"
              aria-selected={i === active}
              tabIndex={-1}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(entry)}
              className={`interaction-button block min-h-12 w-full rounded-none border-b border-line px-4 py-3 text-left last:border-b-0 ${i === active ? "bg-calm" : "hover:bg-subtle"}`}
            >
              <span className="block break-words text-sm font-bold">{entry.t}</span>
              <span className="block text-xs text-muted">{entry.k} · {entry.s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
