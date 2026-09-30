"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";

const TEXTBLOCK_PREVIEW_STORAGE_KEY = "stackly-textblock-preview-html";

export default function BlockPreviewPage() {
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setPreviewHtml(window.localStorage.getItem(TEXTBLOCK_PREVIEW_STORAGE_KEY) ?? "");
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  if (previewHtml === null) {
    return <main className="min-h-screen bg-[#f5f7fb]" />;
  }

  if (!previewHtml) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7fb] px-4 text-center text-[#0B1D40]">
        <h1 className="text-2xl font-black">No preview available</h1>
        <p className="mt-3 max-w-md text-sm text-slate-500">Open the editor, make your changes, and click Preview again.</p>
        <Link href="/blockpages" className="mt-6 rounded-md bg-[#0B1D40] px-5 py-2.5 text-sm font-bold text-white">
          Back to editor
        </Link>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#f5f7fb]" dangerouslySetInnerHTML={{ __html: previewHtml }} />
      <Footer />
    </>
  );
}
