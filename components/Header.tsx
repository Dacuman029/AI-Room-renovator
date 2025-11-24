import React from 'react';
import { Download, ArrowLeft, MoreVertical } from 'lucide-react';

interface HeaderProps {
  onHomeClick: () => void;
  onHistoryClick: () => void;
  currentStep: string;
  onInstallClick?: () => void;
  canInstall?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onHomeClick, 
  onHistoryClick, 
  currentStep,
  onInstallClick,
  canInstall,
  onBack
}) => {
  const getTitle = () => {
    switch(currentStep) {
      case 'upload': return 'Start Your Renovation';
      case 'style': return 'Choose Your Style';
      case 'preferences': return 'Design Preferences';
      case 'processing': return 'Designing...';
      case 'results': return 'Your Result';
      case 'history': return 'My Designs';
      default: return 'RenovatorAI';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#faf7f7] z-50 flex items-center px-6 md:justify-center">
      <div className="w-full max-w-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && currentStep !== 'upload' ? (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-[#f1eae4] active:bg-[#eaddd5] transition-colors"
            >
              <ArrowLeft size={24} className="text-[#27474e]" />
            </button>
          ) : null}
          
          <h1 className="text-2xl font-bold text-[#27474e] tracking-tight font-serif">
            {getTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-2">
           {canInstall && (
             <button
               onClick={onInstallClick}
               className="p-2 rounded-full hover:bg-[#f1eae4] text-[#27474e]"
               title="Install App"
             >
               <Download size={24} />
             </button>
           )}
           <button className="p-2 -mr-2 rounded-full hover:bg-[#f1eae4] text-[#27474e]">
             <MoreVertical size={24} />
           </button>
        </div>
      </div>
    </header>
  );
};