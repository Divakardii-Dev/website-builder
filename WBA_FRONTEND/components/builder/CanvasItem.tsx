"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Copy, X } from "lucide-react";
import { componentRegistry } from "@/lib/componentRegistry";
import { useBuilderStore } from "@/store/builderStore";
import type { BuilderComponent } from "@/types/builder";

function CanvasItem({
  component,
  isDropTarget = false,
  onDelete,
  onDuplicate,
  onSelect,
}: {
  component: BuilderComponent;
  isDropTarget?: boolean;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const Renderer = componentRegistry[component.type];
  const isSelected = useBuilderStore((s) => s.selectedComponentId === component.id);
  const updateComponent = useBuilderStore((s) => s.updateComponent);
  const setInlineEditing = useBuilderStore((s) => s.setInlineEditing);
  const [isEditing, setIsEditing] = useState(false);
  const isInlineEditable = component.type === "heading" || component.type === "text" || component.type === "button";
  const isSectionComponent = component.type === "contact" || component.type === "hero" || component.type === "navigation" || component.type === "features" || component.type === "gallery";

  useEffect(() => {
    if (!isSelected && isEditing) {
      const timeout = window.setTimeout(() => {
        setIsEditing(false);
        setInlineEditing(false);
      }, 0);

      return () => window.clearTimeout(timeout);
    }
  }, [isSelected, isEditing, setInlineEditing]);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (isEditing) return;
      onSelect(component.id);
    },
    [onSelect, component.id, isEditing],
  );

  const handleDuplicate = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onDuplicate(component.id);
    },
    [onDuplicate, component.id],
  );

  const handleDelete = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onDelete(component.id);
    },
    [onDelete, component.id],
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onSelect(component.id);
      setIsEditing(true);
      setInlineEditing(true);
    },
    [onSelect, component.id, setInlineEditing],
  );

  const handleInlineUpdate = useCallback(
    (content: string | null) => {
      if (content !== null) {
        updateComponent(component.id, { content });
      }
      setIsEditing(false);
      setInlineEditing(false);
    },
    [updateComponent, component.id, setInlineEditing],
  );

  const handleSectionUpdate = useCallback(
    (content: string | null) => {
      if (content !== null) {
        updateComponent(component.id, { content });
      }
    },
    [updateComponent, component.id],
  );

  const nestedChildren = useMemo(
    () =>
      component.children.length > 0
        ? component.children.map((child) => (
            <CanvasItem
              key={child.id}
              component={child}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onSelect={onSelect}
            />
          ))
        : null,
    [component.children, onDelete, onDuplicate, onSelect],
  );

  return (
    <div
      className={`flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border bg-white transition-all duration-200 ${isSelected ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.18),0_20px_50px_rgba(15,35,75,0.12)]" : "border-[#dbe3ef] shadow-[0_4px_20px_rgba(15,35,75,0.06)] hover:border-blue-200 hover:shadow-[0_8px_30px_rgba(15,35,75,0.1)]"}`}
      onClick={isEditing ? undefined : handleClick}
    >
      <div className={`flex items-center justify-between border-b px-5 py-4 transition-colors duration-200 sm:px-6 ${isSelected ? "border-blue-100 bg-blue-50/50" : "border-[#e6edf5] bg-white"}`}>
        <h2 className="text-[18px] font-bold capitalize text-[#0B1D40]">{component.type}</h2>
        <div className="flex items-center gap-1">
          <button
            className="rounded p-1.5 text-[#566583] transition hover:bg-gray-100 hover:text-[#0B1D40]"
            onClick={handleDuplicate}
            title="Duplicate block"
            type="button"
          >
            <Copy className="h-[17px] w-[17px]" strokeWidth={2.2} />
          </button>
          <button
            className="rounded p-1.5 text-red-500 transition hover:bg-red-50"
            onClick={handleDelete}
            title="Delete block"
            type="button"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <div
        className={`relative flex w-full flex-1 flex-col items-start overflow-y-auto p-5 pb-8 transition-colors duration-150 sm:p-8 sm:pb-10 ${
          isEditing
            ? "bg-blue-50/30"
            : isDropTarget && component.type === "container"
              ? "bg-blue-50/50 ring-2 ring-inset ring-blue-400/50"
              : ""
        } ${isInlineEditable && isSelected && !isEditing ? "cursor-text" : ""}`}
        onDoubleClick={isInlineEditable ? handleDoubleClick : undefined}
      >
        <Renderer component={component} isEditing={isEditing} onUpdate={isSectionComponent ? handleSectionUpdate : (isEditing ? handleInlineUpdate : undefined)}>
          {nestedChildren}
        </Renderer>
      </div>
    </div>
  );
}

export default memo(CanvasItem);
