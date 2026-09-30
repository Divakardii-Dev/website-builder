import type { ReactNode } from "react";
import type { BuilderComponent } from "@/types/builder";
import { toReactStyle } from "./componentStyles";

export default function ContainerComponent({ component, children }: { component: BuilderComponent; children?: ReactNode }) {
  return (
    <section className="min-h-[120px] w-full border border-dashed border-[#dbe3ef]" style={toReactStyle(component.styles)}>
      {children ?? (
        <div className="flex min-h-[72px] items-center justify-center text-sm font-semibold text-[#566583]">
          Container
        </div>
      )}
    </section>
  );
}
