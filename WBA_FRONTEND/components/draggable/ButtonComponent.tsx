"use client";

import { type LegacyRef, useLayoutEffect, useRef } from "react";
import type { BuilderComponent } from "@/types/builder";
import { toReactStyle } from "./componentStyles";

export default function ButtonComponent({
  component,
  isEditing = false,
  onUpdate,
}: {
  component: BuilderComponent;
  isEditing?: boolean;
  onUpdate?: (content: string | null) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const originalRef = useRef(component.content);
  const committedRef = useRef(false);

  useLayoutEffect(() => {
    if (!isEditing || !ref.current) return;
    originalRef.current = component.content;
    committedRef.current = false;
    ref.current.textContent = component.content;
    ref.current.focus();
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [component.content, isEditing]);

  const className = `inline-flex items-center justify-center font-bold shadow-sm transition-[outline,box-shadow] duration-150 ${
    isEditing
      ? "cursor-text ring-2 ring-blue-400/70 ring-offset-1 pointer-events-auto"
      : "hover:-translate-y-[1px] hover:shadow-md active:scale-[0.98] pointer-events-none select-none"
  }`;

  if (isEditing) {
    return (
      <span
        ref={ref as unknown as LegacyRef<HTMLSpanElement>}
        contentEditable="true"
        suppressContentEditableWarning
        className={className}
        role="button"
        style={toReactStyle(component.styles)}
        tabIndex={0}
        onBlur={(e) => {
          if (committedRef.current) { committedRef.current = false; return; }
          onUpdate?.(e.currentTarget.textContent ?? "");
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            e.preventDefault();
            committedRef.current = true;
            onUpdate?.(e.currentTarget.textContent ?? "");
          } else if (e.key === "Escape") {
            e.preventDefault();
            committedRef.current = true;
            if (ref.current) ref.current.textContent = originalRef.current;
            onUpdate?.(null);
          }
        }}
      />
    );
  }

  return (
    <button className={className} style={toReactStyle(component.styles)} type="button">
      {component.content}
    </button>
  );
}
