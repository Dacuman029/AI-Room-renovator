
import React from 'react';
import { SavedDesign } from '../types';
import { Trash2, Box, Square, ArrowRight } from 'lucide-react';

interface HistoryStepProps {
  designs: SavedDesign[];
  onSelectDesign: (design: SavedDesign) => void;
  onDeleteDesign: (id: string, e: React.MouseEvent) => void;
  onNewDesign: () => void;
}

export const HistoryStep: React.FC<HistoryStepProps> = ({ 
  designs, 
  onSelectDesign, 
  onDeleteDesign,
  onNewDesign
}) => {

  if (designs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-20 h-20 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-4 text-[#9CA3AF]">
          <Box size={32} />
        </div>
        <h2 className="text-xl font-medium text-[#1C1B1F]">No designs yet</h2>
        <p className="text-[#49454F] text-sm mt-1 mb-6">Create your first renovation plan.</p>
        <button 
          onClick={onNewDesign}
          className="bg-[#6750A4] text-white px-6 py-2.5 rounded-full font-medium"
        >
          Start Renovating
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      {designs.map((design) => (
        <div 
          key={design.id} 
          onClick={() => onSelectDesign(design)}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E5E7EB] active:scale-[0.98] transition-transform"
        >
          <div className="relative aspect-video bg-gray-100">
            <img 
              src={design.generatedImage} 
              alt="Design" 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md">
               {design.roomType === 'whole_room' ? 'ROOM' : 'WALL'}
            </div>
            <button
               onClick={(e) => onDeleteDesign(design.id, e)}
               className="absolute top-2 right-2 p-2 bg-white/80 rounded-full text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-start mb-1">
               <h3 className="text-base font-medium text-[#1C1B1F] line-clamp-1">
                 {design.style}
               </h3>
               <span className="text-xs text-[#49454F]">
                 {new Date(design.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
               </span>
            </div>
            <div className="flex items-center text-xs text-[#49454F] gap-2 mt-2">
               <div className="w-4 h-4 rounded-sm overflow-hidden">
                 <img src={design.originalImage} className="w-full h-full object-cover" />
               </div>
               Original included
               <ArrowRight size={12} className="ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
