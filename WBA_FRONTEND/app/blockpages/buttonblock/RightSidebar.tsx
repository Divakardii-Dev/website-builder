import React, { useState } from 'react';
import { ChevronDown, Play, ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { BlockData } from './types';

interface RightSidebarProps {
  selectedBlock: BlockData | null;
  onUpdateBlock: (id: string, props: Record<string, unknown>) => void;
  onClose?: () => void;
}

export default function RightSidebar({ selectedBlock, onUpdateBlock, onClose }: RightSidebarProps) {
  const props = selectedBlock?.props || {};
  const id = selectedBlock?.id || '';
  
  const width = props.width || '600px';
  const borderRadius = props.borderRadius || '18px';

  const [activeTab, setActiveTab] = useState<'button' | 'styles'>('button');
  const [showVideoSettings, setShowVideoSettings] = useState(true);
  const [showPlay, setShowPlay] = useState(true);

  const handleWidthChange = (delta: number) => {
    let currentWidth = parseInt(width.replace(/\D/g, ''));
    if (isNaN(currentWidth)) currentWidth = 600;
    const newWidth = Math.max(100, currentWidth + delta); // minimum 100px
    onUpdateBlock(id, { ...props, width: `${newWidth}px` });
  };

  return (
    <aside className="relative flex h-full w-[286px] flex-shrink-0 flex-col overflow-hidden rounded-xl border border-[#f4d8cc] bg-[#fff7f4] shadow-[0_18px_45px_rgba(113,63,18,0.10)]">
      {/* Mobile Close Button */}
      {onClose && (
        <button 
          className="xl:hidden absolute top-4 right-4 p-1.5 bg-white hover:bg-gray-50 rounded-md text-gray-600 shadow-sm z-10 border border-gray-200 transition-all duration-300 hover:rotate-90 hover:scale-110"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#f2d8cf] bg-white/45 px-6 pt-5">
        <button 
          className={`flex-1 border-b-[2px] pb-4 text-base font-bold transition-colors ${activeTab === 'button' ? 'border-[#0B1D40] text-[#0B1D40]' : 'border-gray-300 text-[#566583] hover:text-[#0B1D40]'}`}
          onClick={() => setActiveTab('button')}
        >
          Button
        </button>
        <button 
          className={`flex-1 border-b-[2px] pb-4 text-base font-bold transition-colors ${activeTab === 'styles' ? 'border-[#0B1D40] text-[#0B1D40]' : 'border-gray-300 text-[#566583] hover:text-[#0B1D40]'}`}
          onClick={() => setActiveTab('styles')}
        >
          Styles
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-8 pt-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {activeTab === 'button' ? (
          <>
            {/* Settings Accordion Header */}
            <button 
              className="w-full flex items-center justify-between text-[15px] font-bold text-[#0B1D40] hover:bg-black/5 p-1 rounded -ml-1 transition"
              onClick={() => setShowVideoSettings(!showVideoSettings)}
            >
              <span>Video Settings</span>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showVideoSettings ? '' : '-rotate-90'}`} />
            </button>

            {showVideoSettings && (
              <div className="space-y-6 pt-2">
                {/* Cover Image */}
        <div>
          <h4 className="text-[#0B1D40] text-[15px] font-bold mb-3">Cover image</h4>
          <div className="relative rounded-lg overflow-hidden h-[90px] bg-slate-300 border border-gray-200">
             <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600&h=400" className="w-full h-full object-cover" alt="Cover" />
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black/20 transition-all duration-300 group"
                onClick={() => alert("Upload dialog would appear to replace image")}
              >
                <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center bg-black/10 backdrop-blur-[2px] group-hover:bg-black/30 transition-transform duration-300 group-hover:scale-110">
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
              </div>
          </div>
        </div>

                {/* Width */}
                <div>
                  <h4 className="text-[#0B1D40] text-[15px] font-bold mb-3">Width</h4>
                  <div className="w-full border border-[#0B1D40] bg-transparent rounded-xl flex items-center justify-between overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 transition-colors">
                    <input 
                      type="text" 
                      className="flex-1 px-4 py-2.5 text-[15px] text-center text-[#0B1D40] font-bold border-r border-[#0B1D40] bg-transparent focus:outline-none"
                      value={width}
                      onChange={(e) => onUpdateBlock(id, { ...props, width: e.target.value })}
                    />
                    <button className="px-3 md:px-4 py-2.5 bg-transparent hover:bg-black/5 text-[#0B1D40] flex-shrink-0 focus:outline-none">
                      <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <h4 className="text-[#0B1D40] text-[15px] font-bold mb-3">Border Radius</h4>
                  <div className="w-full border border-[#0B1D40] bg-transparent rounded-xl flex items-center overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 transition-colors">
                     <input 
                       type="text" 
                       className="w-full text-center py-2.5 text-[15px] text-[#0B1D40] font-bold bg-transparent focus:outline-none"
                       value={borderRadius}
                       onChange={(e) => onUpdateBlock(id, { ...props, borderRadius: e.target.value })}
                     />
                  </div>
                </div>
              </div>
            )}

            {/* Play Controls */}
            <div className="pt-2">
               <button 
                 className="w-full flex items-center justify-between text-[15px] font-bold text-[#0B1D40] mb-4 hover:bg-black/5 p-1 rounded -ml-1 transition"
                 onClick={() => setShowPlay(!showPlay)}
               >
                  <span>Play</span>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showPlay ? '' : '-rotate-90'}`} />
               </button>

                {showPlay && (
                 <>
                   <div className="flex items-center justify-between px-2 mt-3 mb-5">
                     <button className="w-10 h-10 rounded-xl bg-[#0B1D40] text-white flex items-center justify-center shadow-sm hover:bg-[#152B52] transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md">
                       <ChevronLeft className="w-6 h-6" />
                     </button>
                     
                     <span className="text-[#0B1D40] font-semibold text-[26px] leading-none">+</span>
                     
                     <button 
                       className="h-10 px-5 rounded-full bg-[#0B1D40] text-white flex items-center justify-center shadow-sm gap-2 hover:bg-[#152B52] transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md"
                       onClick={() => alert("Forward mapped!")}
                     >
                       <div className="w-[12px] h-[12px] rounded-full bg-white flex-shrink-0"></div>
                       <ChevronRight className="w-6 h-6" />
                     </button>

                     <button className="w-10 h-10 rounded-xl bg-[#0B1D40] text-white flex items-center justify-center shadow-sm hover:bg-[#152B52] transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md">
                       <ChevronRight className="w-6 h-6" />
                     </button>
                   </div>

                   <div className="w-full border border-[#0B1D40] bg-transparent rounded-[14px] flex flex-row items-center justify-between px-6 py-2.5 hover:bg-black/5 transition-colors">
                     <button 
                       className="text-[#0B1D40] hover:text-black font-semibold text-2xl leading-[0] flex items-center justify-center transition-transform hover:scale-110"
                       onClick={() => handleWidthChange(-20)}
                       title="Decrease Width"
                     >
                       –
                     </button>
                     <button 
                       className="text-[#0B1D40] hover:text-black font-semibold text-[26px] leading-[0] flex items-center justify-center transition-transform hover:scale-110"
                       onClick={() => handleWidthChange(20)}
                       title="Increase Width"
                     >
                       +
                     </button>
                     <button 
                       className="text-[#0B1D40] hover:text-black flex justify-center items-center font-medium leading-[0] transition-transform hover:translate-x-1"
                       onClick={() => alert("Flow layout execution.")}
                     >
                       <ChevronRight className="w-[24px] h-[24px]" strokeWidth={2.5}/>
                     </button>
                     <button 
                       className="text-[#0B1D40] hover:text-black flex items-center justify-center leading-[0]"
                       onClick={() => onUpdateBlock(id, { ...props, width: '100%' })}
                       title="Maximize Width"
                     >
                       <LogOut className="w-[20px] h-[20px]" strokeWidth={2.5} />
                     </button>
                   </div>
                 </>
                )}
            </div>
          </>
        ) : (
          <div className="space-y-6 pt-2">
            <div className="text-center p-6 text-gray-400 font-medium text-sm border-2 border-dashed border-gray-200 rounded-lg">
               More typography and color styling options coming soon in next major update.
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
