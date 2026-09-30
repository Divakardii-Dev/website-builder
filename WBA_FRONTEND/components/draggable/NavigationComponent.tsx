"use client";

import InlineText from "@/components/builder/InlineText";
import type { BuilderComponent } from "@/types/builder";
import { toReactStyle } from "./componentStyles";

export default function NavigationComponent({ component, onUpdate }: { component: BuilderComponent; onUpdate?: (content: string | null) => void }) {
  const parts = component.content.split("|");
  const [brand = "Stackly Studio", links = "Home,About,Services,Contact", action = "Get Started"] = parts;
  const linkItems = links.split(",").map((l) => l.trim()).filter(Boolean);

  function savePart(idx: number, val: string) {
    const next = [...parts];
    next[idx] = val;
    onUpdate?.(next.join("|"));
  }

  function saveLink(i: number, val: string) {
    const updated = [...linkItems];
    updated[i] = val;
    savePart(1, updated.join(","));
  }

  return (
    <nav className="flex w-full flex-wrap items-center justify-between gap-4 border border-[#dbe3ef] shadow-sm" style={toReactStyle(component.styles)}>
      <InlineText as="span" value={brand} onSave={(v) => savePart(0, v)} className="text-lg font-bold text-[#0B1D40]" />
      <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[#566583]">
        {linkItems.map((link, i) => (
          <InlineText key={i} as="span" value={link} onSave={(v) => saveLink(i, v)} className="transition hover:text-[#0B1D40]" />
        ))}
      </div>
      <InlineText as="button" value={action} onSave={(v) => savePart(2, v)} className="rounded-md bg-[#0B1D40] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#152B52]" />
    </nav>
  );
}
