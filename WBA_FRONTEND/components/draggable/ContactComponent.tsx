"use client";

import InlineText from "@/components/builder/InlineText";
import type { BuilderComponent } from "@/types/builder";
import { toReactStyle } from "./componentStyles";

export default function ContactComponent({ component, onUpdate }: { component: BuilderComponent; onUpdate?: (content: string | null) => void }) {
  const parts = component.content.split("|");
  const [title = "Ready to launch?", description = "Leave your email and we will help you go live.", placeholder = "Email address", action = "Contact Us"] = parts;

  function save(idx: number, val: string) {
    const next = [...parts];
    next[idx] = val;
    onUpdate?.(next.join("|"));
  }

  return (
    <section className="w-full border border-[#dbe3ef] shadow-sm" style={toReactStyle(component.styles)}>
      <div className="grid gap-5 md:grid-cols-[1fr_1fr] md:items-end">
        <div>
          <InlineText as="h2" value={title} onSave={(v) => save(0, v)} className="text-2xl font-bold text-[#0B1D40]" />
          <InlineText as="p" value={description} onSave={(v) => save(1, v)} className="mt-2 text-sm font-medium leading-6 text-[#566583]" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input className="min-w-0 flex-1 rounded-md border border-[#dbe3ef] px-4 py-3 text-sm font-semibold text-[#0B1D40] outline-none focus:ring-2 focus:ring-blue-100" placeholder={placeholder} readOnly />
          <InlineText as="button" value={action} onSave={(v) => save(3, v)} className="rounded-md bg-[#0B1D40] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#152B52]" />
        </div>
      </div>
    </section>
  );
}
