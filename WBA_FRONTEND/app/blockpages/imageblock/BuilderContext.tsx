"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type ElementStyle = "circle" | "play" | "square" | "video" | "default";

export type BuilderElement = {
  id: string;
  label: string;
  link: string;
  opacity: number;
  position: string;
  buttonStyle: ElementStyle;
};

type BuilderElements = Record<string, BuilderElement>;

type BuilderContextValue = {
  elements: BuilderElements;
  activeElementId: string | null;
  historyStack: BuilderElements[];
  futureStack: BuilderElements[];
  setActiveElementId: (id: string | null) => void;
  updateElement: (id: string, updates: Partial<BuilderElement>) => void;
  undo: () => void;
  redo: () => void;
};

const initialElements: BuilderElements = {
  "btn-1": {
    id: "btn-1",
    label: "Upload Image",
    link: "#",
    opacity: 100,
    position: "20",
    buttonStyle: "default",
  },
  "btn-2": {
    id: "btn-2",
    label: "Choose Image",
    link: "#",
    opacity: 100,
    position: "20",
    buttonStyle: "default",
  },
  "btn-3": {
    id: "btn-3",
    label: "Select Image",
    link: "#",
    opacity: 100,
    position: "20",
    buttonStyle: "default",
  },
};

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function BuilderProvider({ children }: { children: React.ReactNode }) {
  const [historyStack, setHistoryStack] = useState<BuilderElements[]>([initialElements]);
  const [futureStack, setFutureStack] = useState<BuilderElements[]>([]);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);

  const elements = historyStack[historyStack.length - 1];

  const updateElement = (id: string, updates: Partial<BuilderElement>) => {
    setHistoryStack((currentHistory) => {
      const current = currentHistory[currentHistory.length - 1];

      if (!current[id]) {
        return currentHistory;
      }

      const next = {
        ...current,
        [id]: {
          ...current[id],
          ...updates,
        },
      };

      return [...currentHistory, next];
    });
    setFutureStack([]);
  };

  const undo = () => {
    setHistoryStack((currentHistory) => {
      if (currentHistory.length <= 1) {
        return currentHistory;
      }

      const previous = currentHistory.slice(0, -1);
      const latest = currentHistory[currentHistory.length - 1];
      setFutureStack((currentFuture) => [latest, ...currentFuture]);
      return previous;
    });
  };

  const redo = () => {
    setFutureStack((currentFuture) => {
      if (currentFuture.length === 0) {
        return currentFuture;
      }

      const [next, ...remaining] = currentFuture;
      setHistoryStack((currentHistory) => [...currentHistory, next]);
      return remaining;
    });
  };

  const value = useMemo(
    () => ({
      elements,
      activeElementId,
      historyStack,
      futureStack,
      setActiveElementId,
      updateElement,
      undo,
      redo,
    }),
    [activeElementId, elements, futureStack, historyStack],
  );

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

export function useBuilder() {
  const context = useContext(BuilderContext);

  if (!context) {
    throw new Error("useBuilder must be used inside BuilderProvider");
  }

  return context;
}
