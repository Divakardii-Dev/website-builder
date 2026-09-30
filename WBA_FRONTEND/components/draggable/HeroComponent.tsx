"use client";

import InlineText from "@/components/builder/InlineText";
import type { BuilderComponent } from "@/types/builder";
import { toReactStyle } from "./componentStyles";

export default function HeroComponent({ component, onUpdate }: { component: BuilderComponent; onUpdate?: (content: string | null) => void }) {
  const parts = component.content.split("|");
  const [title = "Create a website in minutes", description = "Design and export a clean page.", action = "Start Building"] = parts;

  function save(idx: number, val: string) {
    const next = [...parts];
    next[idx] = val;
    onUpdate?.(next.join("|"));
  }

  return (
    <section className="w-full overflow-hidden border border-[#dbe3ef]" style={toReactStyle(component.styles)}>
      <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <div>
          <InlineText as="h1" value={title} onSave={(v) => save(0, v)} className="text-[34px] font-bold leading-tight text-[#0B1D40]" />
          <InlineText as="p" value={description} onSave={(v) => save(1, v)} className="mt-4 max-w-[560px] text-base font-medium leading-7 text-[#566583]" />
          <InlineText as="button" value={action} onSave={(v) => save(2, v)} className="mt-6 rounded-md bg-[#0B1D40] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#152B52]" />
        </div>
        <div className="min-h-[180px] rounded-lg border border-[#dbe3ef] bg-white p-4 shadow-sm">
          <div className="mb-3 h-3 w-24 rounded-full bg-[#dbe3ef]" />
          <div className="grid gap-3">
            <div className="h-16 rounded bg-[#f7f9fc]" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 rounded bg-[#f7f9fc]" />
              <div className="h-20 rounded bg-[#f7f9fc]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
