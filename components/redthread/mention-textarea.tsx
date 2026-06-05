"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { searchOperatives } from "@/lib/actions/operatives";
import { cn } from "@/lib/utils";

/** A mention-in-progress is `@` + handle chars at the caret, after start/space. */
const TRIGGER = /(?:^|\s)@([a-zA-Z0-9_.-]{0,24})$/;

/**
 * MentionTextarea — a Textarea with `@shadow_name` autocomplete. Detects a
 * mention being typed at the caret, suggests operatives, and inserts the picked
 * handle. `onEnter` fires on ⌘/Ctrl+Enter (never while the suggestion list is open).
 */
export function MentionTextarea({
  value,
  onChange,
  onEnter,
  className,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
} & Omit<React.ComponentProps<typeof Textarea>, "value" | "onChange">) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [atIndex, setAtIndex] = useState(0);
  const [items, setItems] = useState<string[]>([]);
  const [active, setActive] = useState(0);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    onChange(v);
    const caret = e.target.selectionStart ?? v.length;
    const m = v.slice(0, caret).match(TRIGGER);
    if (m) {
      setQuery(m[1]);
      setAtIndex(caret - m[1].length - 1);
    } else {
      setQuery(null);
      setItems([]);
    }
  }

  useEffect(() => {
    if (query === null) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const res = await searchOperatives(query);
      if (!cancelled) {
        setItems(res.map((r) => r.name));
        setActive(0);
      }
    }, 140);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  function pick(name: string) {
    const caret = ref.current?.selectionStart ?? value.length;
    const before = value.slice(0, atIndex);
    const after = value.slice(caret);
    const next = `${before}@${name} ${after}`;
    onChange(next);
    setQuery(null);
    setItems([]);
    const pos = before.length + name.length + 2; // '@' + name + ' '
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(pos, pos);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const open = query !== null && items.length > 0;
    if (open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => (a + 1) % items.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => (a - 1 + items.length) % items.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        pick(items[active]);
        return;
      }
      if (e.key === "Escape") {
        setQuery(null);
        setItems([]);
        return;
      }
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && onEnter) {
      e.preventDefault();
      onEnter();
    }
  }

  const open = query !== null && items.length > 0;

  return (
    <div className="relative">
      <Textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={className}
        {...rest}
      />
      {open && (
        <ul
          role="listbox"
          className="absolute z-40 mt-1 max-h-44 w-56 overflow-auto rounded-sm border border-border bg-card p-1 shadow-lg"
        >
          {items.map((name, i) => (
            <li key={name} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(name);
                }}
                className={cn(
                  "block w-full rounded-sm px-2 py-1 text-left font-mono text-xs",
                  i === active
                    ? "bg-redthread/20 text-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                @{name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
