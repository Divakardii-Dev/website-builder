"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Play, RectangleHorizontal, Video, AlignLeft, PaintBucket, FlipHorizontal, FlipVertical, Circle } from "lucide-react";
import { useBuilder, ElementStyle } from "./BuilderContext";

export default function RightSidebar() {
  const [activeTab, setActiveTab] = useState("Button");
  const { elements, activeElementId, updateElement } = useBuilder();

  // Accordion states
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isStyleOpen, setIsStyleOpen] = useState(true);
  const [isPositionOpen, setIsPositionOpen] = useState(true);

  // If no element is selected, or the selected element isn't available, we show a default placeholder state
  const activeEl = activeElementId ? elements[activeElementId] : null;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeElementId) updateElement(activeElementId, { label: e.target.value });
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeElementId) updateElement(activeElementId, { link: e.target.value });
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeElementId) {
      const val = parseInt(e.target.value) || 0;
      updateElement(activeElementId, { opacity: Math.min(100, Math.max(0, val)) });
    }
  };

  const handleStyleChange = (style: ElementStyle) => {
    if (activeElementId) updateElement(activeElementId, { buttonStyle: style });
  };

  const handleMockAction = (action: string) => {
    alert(`${action} functionality triggered successfully!`);
  };

  return (
    <>
      <aside className="relative z-30 hidden h-full w-[286px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#efd9ce] bg-[#fff7f4] shadow-[0_18px_45px_rgba(110,60,35,0.10)] transition-transform duration-300 lg:flex">
        <div className="custom-scrollbar flex h-full flex-col overflow-y-auto bg-[#fff7f4]">
      {/* Tabs */}
      <div className="flex shrink-0 border-b border-[#f2d8cf] bg-white/45 px-6 pt-5">
        <button
          className={`flex-1 border-b-[2px] pb-4 text-base font-bold transition-colors ${activeTab === "Button" ? "border-[#0B1D40] text-[#0B1D40]" : "border-gray-300 text-[#566583] hover:text-[#0B1D40]"}`}
          onClick={() => setActiveTab("Button")}
        >
          Button
        </button>
        <button
          className={`flex-1 border-b-[2px] pb-4 text-base font-bold transition-colors ${activeTab === "Style" ? "border-[#0B1D40] text-[#0B1D40]" : "border-gray-300 text-[#566583] hover:text-[#0B1D40]"}`}
          onClick={() => setActiveTab("Style")}
        >
          Styles
        </button>
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-1 relative ${!activeEl ? 'opacity-50 pointer-events-none' : 'opacity-100 transition-opacity'}`}>
        {!activeEl && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-[85%] pointer-events-auto z-10">
            <p className="text-sm text-[#0c1b33] font-medium bg-slate-50 p-4 rounded-lg shadow-sm border border-slate-200">
              Select a button on the canvas to edit its properties.
            </p>
          </div>
        )}

        {/* --- BUTTON TAB CONTENT --- */}
        {activeTab === "Button" && (
          <div className="flex flex-col gap-5 border-b border-[#efd9ce] p-4">
            <div 
              className="flex items-center justify-between text-[15px] font-bold text-[#0c1b33] cursor-pointer hover:opacity-80"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <span>Bitone Settings</span>
              {isSettingsOpen ? <ChevronDown size={18} className="text-[#0c1b33]" /> : <ChevronRight size={18} className="text-[#0c1b33]" />}
            </div>

            {isSettingsOpen && (
              <div className="flex flex-col gap-5 animate-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="block text-[13px] font-bold text-[#0c1b33] mb-2">Button Label</label>
                  <input
                    type="text"
                    value={activeEl?.label || "Click Me!"}
                    onChange={handleLabelChange}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-[13px] text-[#0c1b33] font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[13px] font-bold text-[#0c1b33]">Button Link</label>
                    <Plus size={16} className="text-[#0c1b33] cursor-pointer hover:scale-110 transition" onClick={() => handleMockAction("Add dynamic link")} />
                  </div>
                  <input
                    type="text"
                    value={activeEl?.link || "#"}
                    onChange={handleLinkChange}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-[13px] text-[#0c1b33] font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- STYLE TAB CONTENT --- */}
        {activeTab === "Style" && (
          <>
            {/* Section: Style & Opacity */}
            <div className="flex flex-col gap-5 border-b border-[#efd9ce] p-4">
              <div 
                className="flex items-center justify-between text-[15px] font-bold text-[#0c1b33] cursor-pointer hover:opacity-80"
                onClick={() => setIsStyleOpen(!isStyleOpen)}
              >
                <span>Styles</span>
                {isStyleOpen ? <ChevronDown size={18} className="text-[#0c1b33]" /> : <ChevronRight size={18} className="text-[#0c1b33]" />}
              </div>

              {isStyleOpen && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex border border-slate-300 rounded-lg p-1.5 gap-1 items-center bg-white shadow-sm">
                    <button
                      onClick={() => handleStyleChange("circle")}
                      className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${activeEl?.buttonStyle === "circle" ? "border-2 border-[#0c1b33] shadow-sm" : "border-2 border-transparent hover:bg-slate-50"}`}
                    >
                      <Circle size={16} className="text-[#0c1b33] fill-[#0c1b33]" />
                    </button>
                    <button
                      onClick={() => handleStyleChange("play")}
                      className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${activeEl?.buttonStyle === "play" ? "border-2 border-[#0c1b33] shadow-sm" : "border-2 border-transparent hover:bg-slate-50"}`}
                    >
                      <Play size={16} className="text-[#0c1b33] fill-[#0c1b33]" />
                    </button>
                    <button
                      onClick={() => handleStyleChange("square")}
                      className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${activeEl?.buttonStyle === "square" ? "border-2 border-[#0c1b33] shadow-sm" : "border-2 border-transparent hover:bg-slate-50"}`}
                    >
                      <RectangleHorizontal size={16} className="text-[#0c1b33]" />
                    </button>
                    <button
                      onClick={() => handleStyleChange("video")}
                      className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${activeEl?.buttonStyle === "video" ? "border-2 border-[#0c1b33] shadow-sm" : "border-2 border-transparent hover:bg-slate-50"}`}
                    >
                      <Video size={16} className="text-[#0c1b33]" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[#0c1b33] mb-3">Opacity</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={activeEl?.opacity ?? 100}
                          onChange={handleOpacityChange}
                          className="w-full h-[3px] bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#0c1b33]"
                        />
                      </div>
                      <div className="border border-slate-300 rounded-md px-2 py-1 min-w-[45px] flex justify-center bg-white shadow-sm">
                         <span className="text-[12px] font-bold text-[#0c1b33]">{activeEl?.opacity ?? 100}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section: Position */}
            <div className="p-4 flex flex-col gap-4">
              <div 
                className="flex items-center justify-between text-[15px] font-bold text-[#0c1b33] cursor-pointer hover:opacity-80"
                onClick={() => setIsPositionOpen(!isPositionOpen)}
              >
                <span>Position</span>
                {isPositionOpen ? <ChevronDown size={18} className="text-[#0c1b33]" /> : <ChevronRight size={18} className="text-[#0c1b33]" />}
              </div>
              
              {isPositionOpen && (
                <div className="border border-slate-300 rounded-lg p-2 flex items-center justify-between shadow-sm bg-white animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2 py-1 pl-1 cursor-pointer hover:opacity-70" onClick={() => handleMockAction("Edit Alignment")}>
                    <span className="text-[13px] text-[#0c1b33] font-medium">{activeEl?.position || "20"}</span>
                    <AlignLeft size={14} className="text-[#0c1b33]" />
                  </div>
                  <div className="flex items-center gap-2 border border-slate-300 rounded-full px-2 py-1 bg-slate-50/50">
                    <PaintBucket size={14} className="text-[#0c1b33] cursor-pointer hover:text-blue-600 transition" onClick={() => handleMockAction("Change Fill Color")} />
                    <FlipHorizontal size={14} className="text-[#0c1b33] cursor-pointer hover:text-blue-600 transition" onClick={() => handleMockAction("Flip Horizontally")} />
                    <FlipVertical size={14} className="text-[#0c1b33] cursor-pointer hover:text-blue-600 transition" onClick={() => handleMockAction("Flip Vertically")} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
        </div>
      </aside>
    </>
  );
}
