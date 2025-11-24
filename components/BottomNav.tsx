import React from 'react';
import { Home, LayoutGrid, Plus } from 'lucide-react';

interface BottomNavProps {
  currentStep: string;
  onHomeClick: () => void;
  onHistoryClick: () => void;
  onNewDesignClick: () => void;
  onInstallClick?: () => void;
  canInstall?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentStep,
  onHomeClick,
  onHistoryClick,
  onNewDesignClick
}) => {
  // Logic to determine active tab for styling
  const isHome = currentStep === 'upload' || currentStep === 'style' || currentStep === 'preferences' || currentStep === 'processing' || currentStep === 'results';
  const isHistory = currentStep === 'history';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#faf7f7] h-[80px] z-50 pb-[env(safe-area-inset-bottom)] flex justify-center border-t border-[#f1eae4]">
      <div className="w-full max-w-lg flex justify-around items-center px-2">
        
        {/* Home Tab */}
        <button 
          onClick={onHomeClick}
          className="flex flex-col items-center gap-1 w-16 group"
        >
          <div className={`w-16 h-8 rounded-full flex items-center justify-center transition-colors ${isHome ? 'bg-[#f1eae4] text-[#6e293c]' : 'bg-transparent text-[#27474e]/60'}`}>
            <Home size={24} fill={isHome ? "currentColor" : "none"} />
          </div>
          <span className={`text-xs font-medium ${isHome ? 'text-[#27474e]' : 'text-[#27474e]/60'}`}>Home</span>
        </button>

        {/* Create FAB (integrated in nav for this layout) */}
        <button 
          onClick={onNewDesignClick}
          className="flex flex-col items-center justify-center -mt-8"
        >
          <div className="bg-[#27474e] text-white h-14 w-14 rounded-[16px] flex items-center justify-center shadow-lg shadow-[#27474e]/20 active:scale-95 transition-transform hover:-translate-y-1">
            <Plus size={28} />
          </div>
        </button>

        {/* Saved Tab */}
        <button 
          onClick={onHistoryClick}
          className="flex flex-col items-center gap-1 w-16 group"
        >
          <div className={`w-16 h-8 rounded-full flex items-center justify-center transition-colors ${isHistory ? 'bg-[#f1eae4] text-[#6e293c]' : 'bg-transparent text-[#27474e]/60'}`}>
            <LayoutGrid size={24} fill={isHistory ? "currentColor" : "none"} />
          </div>
          <span className={`text-xs font-medium ${isHistory ? 'text-[#27474e]' : 'text-[#27474e]/60'}`}>Saved</span>
        </button>

      </div>
    </div>
  );
};