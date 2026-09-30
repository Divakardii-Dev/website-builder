"use client";

import InlineText from "@/components/builder/InlineText";
import type { BuilderComponent } from "@/types/builder";
import { toReactStyle } from "./componentStyles";

export default function FeaturesComponent({ component, onUpdate }: { component: BuilderComponent; onUpdate?: (content: string | null) => void }) {
  const lines = component.content.split("\n");
  const features = lines.map((item) => item.split("|")).filter(([title]) => title?.trim());

  function saveField(lineIdx: number, partIdx: number, val: string) {
    const updated = [...lines];
    const parts = (updated[lineIdx] ?? "").split("|");
    parts[partIdx] = val;
    updated[lineIdx] = parts.join("|");
    onUpdate?.(updated.join("\n"));
  }

  return (
    <section className="w-full border border-[#dbe3ef] shadow-sm" style={toReactStyle(component.styles)}>
      <div className="grid gap-4 md:grid-cols-3">
        {features.map(([title, description], index) => (
          <article className="rounded-lg border border-[#dbe3ef] bg-[#f7f9fc] p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-md" key={`${title}-${index}`}>
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-[#0B1D40] text-sm font-bold text-white">
              {index + 1}
            </div>
            <InlineText as="h3" value={title ?? ""} onSave={(v) => saveField(index, 0, v)} className="text-base font-bold text-[#0B1D40]" />
            <InlineText as="p" value={description ?? ""} onSave={(v) => saveField(index, 1, v)} className="mt-2 text-sm font-medium leading-6 text-[#566583]" />
          </article>
        ))}
      </div>
    </section>
  );
}
