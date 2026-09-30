"use client";
import React from "react";
import { ChevronDown, Undo2, Redo2, Eye, Send, X, Image as ImageIcon, Save } from "lucide-react";
import { useBuilder, BuilderElement } from "./BuilderContext";

export default function MainCanvas() {
  const { elements, activeElementId, setActiveElementId, undo, redo, historyStack, futureStack } = useBuilder();

  const mountainSrc1 = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80";
  const mountainSrc2 = "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80";

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Dynamic button styles mapper
  const getStyleClass = (style: BuilderElement["buttonStyle"]) => {
    switch (style) {
      case "circle": return "rounded-full";
      case "square": return "rounded-none";
      case "video": return "rounded-lg border-2 border-dashed";
      case "play": return "rounded-tr-xl rounded-bl-xl";
      default: return "rounded-md";
    }
  };

  const handleAction = (action: string) => {
    alert(`${action} functionality triggered successfully!`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a fully functional app, this would upload the file to a server or process it locally.
      alert(`Successfully selected file: ${file.name}`);
    }
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dbe3ef] bg-[#f7f9fc] shadow-[0_18px_45px_rgba(15,35,75,0.08)]">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,video/*"
      />

      {/* Top Bar */}
      <div className="z-10 flex h-[64px] shrink-0 items-center justify-between gap-4 overflow-x-auto border-b border-[#dbe3ef] bg-white px-3 shadow-sm md:px-5">
        <button
          onClick={() => handleAction("Switch Website")}
          className="flex items-center gap-2 whitespace-nowrap rounded px-2 py-1.5 text-[14px] font-bold text-[#0B1D40] transition-colors hover:bg-gray-100 md:text-[15px]"
        >
          My Website
          <ChevronDown className="h-4 w-4 text-gray-600" />
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex flex-shrink-0 items-center overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm">
            <button 
              onClick={undo}
              disabled={historyStack.length <= 1}
              className={`border-r border-gray-300 px-3 py-2 transition-colors ${historyStack.length > 1 ? 'text-gray-600 hover:bg-gray-50 cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
              title="Undo"
            >
              <Undo2 className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
            <button 
              onClick={redo}
              disabled={futureStack.length === 0}
              className={`px-3 py-2 transition-colors ${futureStack.length > 0 ? 'text-gray-600 hover:bg-gray-50 cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
              title="Redo"
            >
              <Redo2 className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
          </div>

          <button onClick={() => handleAction("Save Draft")} className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-[13px] font-bold text-[#0B1D40] shadow-sm transition-colors hover:bg-gray-50" title="Save Draft">
            <Save className="h-4 w-4 text-gray-600 lg:hidden" />
            <span className="hidden lg:inline">Save Draft</span>
          </button>
          <button onClick={() => handleAction("Preview")} className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-[13px] font-bold text-[#0B1D40] shadow-sm transition-colors hover:bg-gray-50" title="Preview">
            <Eye className="h-4 w-4" />
            <span className="hidden lg:inline">Preview</span>
          </button>
          <button onClick={() => handleAction("Publish")} className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#0B1D40] px-3 py-2 text-[13px] font-bold text-white shadow-[0_2px_4px_rgba(11,29,64,0.3)] transition-colors hover:bg-[#152B52]" title="Publish">
            <span className="hidden lg:inline">Publish</span>
            <Send className="h-[14px] w-[14px]" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8" onClick={() => setActiveElementId(null)}>
        {/* Editor Container */}
        <div className="min-h-full rounded-xl border border-[#dbe3ef] bg-white p-5 shadow-[0_18px_45px_rgba(15,35,75,0.08)] sm:p-8" onClick={(e) => e.stopPropagation()}>
          {/* Image Blocks Section */}
          <div className="relative rounded-xl border border-[#e6edf5] p-5 sm:p-6">
            <h2 className="text-[#0c1b33] font-bold pb-4 border-b border-slate-100 text-[15px] mb-6 flex justify-between">
              Image Blocks
              <button className="text-slate-600 hover:text-slate-900 cursor-pointer" onClick={() => handleAction("Close Panel")}>
                 <X size={20} className="stroke-[2.5]" />
              </button>
            </h2>

            {/* Image Panel */}
            <h3 className="text-[#0c1b33] font-bold text-[14px] mb-4">Image Panel</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              
              {/* Card 1 - Upload Generic */}
              <div className="bg-white rounded-lg shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-4 pb-5 flex flex-col items-center">
                <div 
                  className="w-full aspect-video bg-[#a5b4fc] bg-opacity-40 rounded-lg flex items-center justify-center mb-4 cursor-pointer hover:opacity-80 transition"
                  onClick={(e) => { e.stopPropagation(); triggerFileUpload(); }}
                >
                  <ImageIcon size={64} className="text-white" />
                </div>
                <p className="text-slate-600 text-[13px] mb-4 font-medium">Upload izze. Timraes</p>
                <div className="w-full relative">
                  {activeElementId === "btn-1" && <div className="absolute -inset-1.5 border-2 border-blue-500 rounded pointer-events-none" />}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveElementId("btn-1"); triggerFileUpload(); }}
                    className={`w-full py-2.5 bg-[#0c1b33] text-white text-[13px] font-medium transition-all duration-300 cursor-pointer ${getStyleClass(elements["btn-1"].buttonStyle)}`}
                    style={{ opacity: elements["btn-1"].opacity / 100 }}
                  >
                    {elements["btn-1"].label}
                  </button>
                </div>
              </div>

              {/* Card 2 - Mountain Image 1 */}
              <div className="bg-white rounded-lg shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-4 pb-5 flex flex-col items-center">
                <div 
                  className="w-full aspect-video rounded-lg overflow-hidden mb-4 cursor-pointer hover:opacity-80 transition"
                  onClick={(e) => { e.stopPropagation(); triggerFileUpload(); }}
                >
                   <img src={mountainSrc1} alt="Mountain view" className="w-full h-full object-cover" />
                </div>
                <p className="text-slate-600 text-[13px] mb-4 font-medium">Upload izze. Timraes</p>
                <div className="w-full relative">
                  {activeElementId === "btn-2" && <div className="absolute -inset-1.5 border-2 border-blue-500 rounded pointer-events-none" />}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveElementId("btn-2"); triggerFileUpload(); }}
                    className={`w-full py-2.5 bg-white text-slate-700 border border-slate-300 text-[13px] font-medium transition-all duration-300 hover:bg-slate-50 cursor-pointer ${getStyleClass(elements["btn-2"].buttonStyle)}`}
                    style={{ opacity: elements["btn-2"].opacity / 100 }}
                  >
                    {elements["btn-2"].label}
                  </button>
                </div>
              </div>

              {/* Card 3 - Mountain Image 2 */}
              <div className="bg-white rounded-lg shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-4 pb-5 flex flex-col items-center">
                <div 
                  className="w-full aspect-video rounded-lg overflow-hidden mb-4 cursor-pointer hover:opacity-80 transition"
                  onClick={(e) => { e.stopPropagation(); triggerFileUpload(); }}
                >
                   <img src={mountainSrc2} alt="Mountain scenery" className="w-full h-full object-cover" />
                </div>
                <p className="text-slate-600 text-[13px] mb-4 font-medium">Upload izze. Timraes</p>
                <div className="w-full relative">
                  {activeElementId === "btn-3" && <div className="absolute -inset-1.5 border-2 border-blue-500 rounded pointer-events-none" />}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveElementId("btn-3"); triggerFileUpload(); }}
                    className={`w-full py-2.5 bg-white text-slate-700 border border-slate-300 text-[13px] font-medium transition-all duration-300 hover:bg-slate-50 cursor-pointer ${getStyleClass(elements["btn-3"].buttonStyle)}`}
                    style={{ opacity: elements["btn-3"].opacity / 100 }}
                  >
                    {elements["btn-3"].label}
                  </button>
                </div>
              </div>

            </div>

            {/* Image Gallery */}
            <h3 className="text-[#0c1b33] font-bold text-[14px] mb-4">Image Gallery</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border border-slate-200 rounded-lg p-6">
              
              {/* Gallery Format 1 */}
              <div 
                className="flex flex-col items-center cursor-pointer hover:opacity-80 transition p-2 rounded hover:bg-slate-50"
                onClick={(e) => { e.stopPropagation(); handleAction("Edit Gallery Formatting"); }}
              >
                <div className="flex gap-2 w-full mb-4 h-32 pointer-events-none">
                  <div className="flex-[1] rounded-md overflow-hidden"><img src={mountainSrc1} className="w-full h-full object-cover" alt="mountains"/></div>
                  <div className="flex-[1] rounded-md overflow-hidden"><img src={mountainSrc2} className="w-full h-full object-cover" alt="mountains"/></div>
                  <div className="flex-[1] rounded-md overflow-hidden"><img src={mountainSrc1} className="w-full h-full object-cover" alt="mountains"/></div>
                </div>
                <p className="text-[#0c1b33] font-bold text-[14px]">Add Your Heading Here</p>
              </div>

              {/* Gallery Format 2 (6 smaller images with text skeleton) */}
              <div 
                className="flex flex-col w-full cursor-pointer hover:opacity-80 transition p-2 rounded hover:bg-slate-50"
                onClick={(e) => { e.stopPropagation(); handleAction("Edit Grid Formatting"); }}
              >
                <div className="grid grid-cols-6 gap-1.5 mb-6 h-[72px] pointer-events-none">
                  <div className="rounded-sm overflow-hidden"><img src={mountainSrc1} className="w-full h-full object-cover" alt="mountains"/></div>
                  <div className="rounded-sm overflow-hidden"><img src={mountainSrc2} className="w-full h-full object-cover" alt="mountains"/></div>
                  <div className="rounded-sm overflow-hidden"><img src={mountainSrc1} className="w-full h-full object-cover" alt="mountains"/></div>
                  <div className="rounded-sm overflow-hidden"><img src={mountainSrc2} className="w-full h-full object-cover" alt="mountains"/></div>
                  <div className="rounded-sm overflow-hidden"><img src={mountainSrc1} className="w-full h-full object-cover" alt="mountains"/></div>
                  <div className="rounded-sm overflow-hidden"><img src={mountainSrc2} className="w-full h-full object-cover" alt="mountains"/></div>
                </div>
                
                {/* Skeleton Text */}
                <div className="flex flex-col items-center gap-2 opacity-60 pointer-events-none">
                     <div className="h-1 bg-slate-300 rounded w-16 mb-2"></div>
                     <div className="h-2 bg-slate-300 rounded w-full"></div>
                     <div className="h-2 bg-slate-300 rounded w-[90%]"></div>
                     <div className="h-2 bg-slate-300 rounded w-[95%]"></div>
                     <div className="h-2 bg-slate-300 rounded w-[80%]"></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
