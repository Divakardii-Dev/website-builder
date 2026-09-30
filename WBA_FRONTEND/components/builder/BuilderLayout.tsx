"use client";

import { useEffect, useRef, useState } from "react";
import { DndContext, DragOverlay, PointerSensor, closestCenter, pointerWithin, useSensor, useSensors, type CollisionDetection, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { ChevronRight, GripVertical } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Canvas from "./Canvas";
import ComponentPalette from "./ComponentPalette";
import PropertyEditor from "./PropertyEditor";
import { useBuilder } from "@/hooks/useBuilder";
import type { ComponentType } from "@/types/builder";

const collisionDetectionStrategy: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    const itemHit = pointerCollisions.find((c) => c.id !== "builder-canvas");
    return itemHit ? [itemHit] : pointerCollisions;
  }

  return closestCenter(args);
};

export default function BuilderLayout() {
  const { components, selectedComponentId, addComponent, updateComponent, duplicateComponent, deleteComponent, selectComponent, reorderComponents, loadStarterWebsite, loadWebsiteFromRequirements, clearCanvas } = useBuilder();
  const [activePaletteType, setActivePaletteType] = useState<ComponentType | null>(null);
  const [activeCanvasType, setActiveCanvasType] = useState<ComponentType | null>(null);
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const searchParams = useSearchParams();
  const hasLoadedRequirements = useRef(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 3 } }));
  const selectedComponent = components.find((component) => component.id === selectedComponentId) || null;

  useEffect(() => {
    if (hasLoadedRequirements.current) {
      return;
    }

    const projectName = searchParams.get("projectName");
    const category = searchParams.get("category");
    const style = searchParams.get("style");
    const sections = searchParams.get("sections");

    if (!projectName && !category && !style && !sections) {
      return;
    }

    hasLoadedRequirements.current = true;
    loadWebsiteFromRequirements({
      projectName: projectName || "My Website",
      category: category || "Business",
      style: style || "Modern",
      sections: sections ? sections.split(",").filter(Boolean) : [],
    });
  }, [loadWebsiteFromRequirements, searchParams]);

  const handleDragStart = (event: DragStartEvent) => {
    const fromPalette = Boolean(event.active.data.current?.fromPalette);
    const type = event.active.data.current?.type as ComponentType | undefined;

    if (fromPalette && type) {
      setActivePaletteType(type);
      return;
    }

    const dragged = components.find((c) => c.id === String(event.active.id));
    setActiveCanvasType(dragged?.type ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActivePaletteType(null);
    setActiveCanvasType(null);

    if (!over) return;

    const fromPalette = Boolean(active.data.current?.fromPalette);
    const type = active.data.current?.type as ComponentType | undefined;
    const activeId = String(active.id);
    const overId = String(over.id);
    const isOverCanvas = overId === "builder-canvas";
    const isOverItem = Boolean(over.data.current?.fromCanvas);

    if (fromPalette && type) {
      if (isOverCanvas) {
        addComponent(type);
      } else if (isOverItem) {
        const overComponent = components.find((c) => c.id === overId);

        if (overComponent?.type === "container") {
          addComponent(type, overId);
        } else {
          addComponent(type, null, overId);
        }
      } else {
        addComponent(type);
      }

      setIsLeftOpen(false);
      return;
    }

    if (activeId !== overId) {
      reorderComponents(activeId, overId);
    }
  };

  const handleDragCancel = () => {
    setActivePaletteType(null);
    setActiveCanvasType(null);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={collisionDetectionStrategy} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#e9eef6] font-sans">
        <div className="relative flex min-h-screen w-full flex-1 flex-shrink-0 gap-4 overflow-hidden p-4">
          <button
            aria-label="Open left sidebar"
            className="absolute left-0 top-5 z-40 flex h-11 w-8 items-center justify-center rounded-r-md border border-l-0 border-[#152B52] bg-[#0B1D40] text-white shadow-lg transition-all duration-300 hover:bg-[#152B52] active:scale-95 lg:hidden"
            onClick={() => setIsLeftOpen(true)}
            type="button"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="hidden lg:flex">
            <ComponentPalette onAdd={addComponent} onLoadStarter={loadStarterWebsite} />
          </div>

          <div className={`fixed inset-0 z-[60] transition-opacity duration-300 lg:hidden ${isLeftOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
            <button aria-label="Close left sidebar" className="absolute inset-0 bg-black/60" onClick={() => setIsLeftOpen(false)} type="button" />
            <div className={`absolute bottom-0 left-0 flex h-[65vh] max-h-[800px] w-full transform flex-col overflow-hidden rounded-t-3xl bg-[#0A193A] shadow-2xl transition-transform duration-300 ${isLeftOpen ? "translate-y-0" : "translate-y-full"}`}>
              <ComponentPalette className="w-full rounded-t-3xl rounded-b-none border-0" onAdd={(type) => { addComponent(type); setIsLeftOpen(false); }} onLoadStarter={() => { loadStarterWebsite(); setIsLeftOpen(false); }} />
            </div>
          </div>

          <Canvas
            components={components}
            onClear={clearCanvas}
            onDelete={deleteComponent}
            onDuplicate={duplicateComponent}
            onLoadStarter={loadStarterWebsite}
            onSelect={selectComponent}
          />

          <PropertyEditor component={selectedComponent} onUpdate={updateComponent} />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {(activePaletteType ?? activeCanvasType) ? (
          <div
            className={`flex min-w-[140px] rotate-[1.5deg] items-center gap-2.5 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold capitalize shadow-[0_12px_32px_rgba(15,35,75,0.22)] ring-1 ${
              activeCanvasType
                ? "border-blue-300 text-blue-700 ring-blue-200/50"
                : "border-[#dbe3ef] text-[#0B1D40] ring-black/5"
            }`}
          >
            <GripVertical className="h-4 w-4 shrink-0 text-gray-400" />
            <span>{activePaletteType ?? activeCanvasType}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
