
import React, { useState } from 'react';
import { RenovationStyle, STYLE_PROMPTS } from '../types';
import { Button } from './Button';
import { Sparkles, Plus, Check } from 'lucide-react';

interface StyleSelectionStepProps {
  onConfirm: (style: string, inspirationImage: string | null) => void;
}

export const StyleSelectionStep: React.FC<StyleSelectionStepProps> = ({ onConfirm }) => {
  const [selectedPreset, setSelectedPreset] = useState<RenovationStyle | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [inspirationImage, setInspirationImage] = useState<string | null>(null);

  const handleInspirationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInspirationImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    let finalPrompt = customPrompt;
    if (selectedPreset && !customPrompt) {
      finalPrompt = STYLE_PROMPTS[selectedPreset];
    } else if (selectedPreset && customPrompt) {
      finalPrompt = `${STYLE_PROMPTS[selectedPreset]} ${customPrompt}`;
    }
    
    if (!finalPrompt && inspirationImage) {
      finalPrompt = "Match the style of the uploaded inspiration image.";
    }

    if (finalPrompt) {
      onConfirm(finalPrompt, inspirationImage);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28">
      
      {/* Presets Grid */}
      <h3 className="text-xs font-bold text-[#49454F] uppercase tracking-wider mb-4 px-1">Choose a Vibe</h3>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {Object.values(RenovationStyle).map((style) => (
          <button
            key={style}
            onClick={() => setSelectedPreset(style)}
            className={`relative p-4 text-left rounded-3xl border transition-all duration-200 active:scale-[0.97] h-24 flex flex-col justify-end ${
              selectedPreset === style 
                ? 'bg-[#E8DEF8] border-[#6750A4] text-[#1D192B] shadow-md' 
                : 'bg-white border-transparent shadow-sm text-[#49454F]'
            }`}
          >
            {selectedPreset === style && (
              <div className="absolute top-3 right-3 bg-[#6750A4] text-white rounded-full p-1">
                <Check size={12} />
              </div>
            )}
            <span className="text-sm font-bold leading-tight">{style}</span>
          </button>
        ))}
      </div>

      {/* Inspiration Image */}
      <div className="mb-6">
         <h3 className="text-xs font-bold text-[#49454F] uppercase tracking-wider mb-4 px-1">Have an idea?</h3>
         <div className="relative">
            {!inspirationImage ? (
              <div className="relative border-2 border-dashed border-[#CAC4D0] rounded-3xl h-28 flex flex-col items-center justify-center bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors">
                <input type="file" accept="image/*" onChange={handleInspirationUpload} className="absolute inset-0 opacity-0 z-10 w-full h-full" />
                <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2">
                  <Plus size={20} className="text-[#6750A4]" />
                </div>
                <span className="text-xs font-medium text-[#49454F]">Upload Pinterest Screenshot</span>
              </div>
            ) : (
              <div className="relative rounded-3xl overflow-hidden h-48 shadow-md">
                <img src={inspirationImage} alt="Inspiration" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20"></div>
                <button 
                onClick={() => setInspirationImage(null)}
                className="absolute top-3 right-3 bg-white/90 text-stone-900 p-2 rounded-full shadow-lg active:scale-90 transition-transform"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
                <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-full text-white text-xs font-bold backdrop-blur-sm">
                  Using as Reference
                </div>
              </div>
            )}
         </div>
      </div>

      {/* Custom Text */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-[#49454F] uppercase tracking-wider mb-4 px-1">Specific Instructions</h3>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="E.g. Emerald green velvet chairs, gold accents, keep it airy..."
          className="w-full p-4 rounded-3xl border border-transparent bg-white shadow-sm focus:ring-2 focus:ring-[#6750A4] outline-none h-32 text-[#1C1B1F] text-sm resize-none"
        />
      </div>

      {/* FAB-like Next Button */}
      <div className="fixed bottom-24 right-4 left-4 z-40 flex justify-end pointer-events-none">
        <div className="pointer-events-auto shadow-2xl rounded-2xl">
          <Button 
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedPreset && !customPrompt && !inspirationImage}
            icon={<Sparkles size={20} />}
          >
            Generate Design
          </Button>
        </div>
      </div>
    </div>
  );
};
