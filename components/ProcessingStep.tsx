import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Circle, Wand2, BrainCircuit, ScanSearch } from 'lucide-react';

export type ProcessStage = 'pending' | 'active' | 'complete';

interface ProcessingStepProps {
  status?: {
    analysis: ProcessStage;
    vision: ProcessStage;
    polishing: ProcessStage;
  };
}

const steps = [
  {
    key: 'analysis',
    label: "Analyzing Room & Style",
    description: "Understanding your geometry and selecting products...",
    icon: BrainCircuit
  },
  {
    key: 'vision',
    label: "Generating Visualization",
    description: "Creating a photorealistic renovation of your space...",
    icon: Wand2
  },
  {
    key: 'polishing',
    label: "Finalizing Details",
    description: "Detecting items and preparing your shopping list...",
    icon: ScanSearch
  }
];

export const ProcessingStep: React.FC<ProcessingStepProps> = ({ status }) => {
  const [progress, setProgress] = useState(5);

  // Calculate progress based on status
  useEffect(() => {
    if (!status) return;

    let target = 5;
    
    // Logic for progress bar percentage
    const analysisPoints = status.analysis === 'complete' ? 40 : (status.analysis === 'active' ? 10 : 0);
    const visionPoints = status.vision === 'complete' ? 45 : (status.vision === 'active' ? 10 : 0);
    const polishingPoints = status.polishing === 'complete' ? 10 : (status.polishing === 'active' ? 5 : 0);
    
    // Base progress if things are active
    if (status.analysis === 'active' && status.vision === 'active' && target < 15) target = 15;
    
    target = 5 + analysisPoints + visionPoints + polishingPoints;
    
    // Cap at 100
    if (target > 100) target = 100;

    setProgress(target);
  }, [status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-in fade-in duration-700 max-w-lg mx-auto w-full">
      
      <div className="text-center mb-8">
        <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">
          Transforming your space
        </h3>
        <p className="text-stone-500">
          Our AI Interior Designer is working on your renovation.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-100 h-2 rounded-full mb-10 overflow-hidden">
        <div 
          className="bg-stone-900 h-full transition-all duration-1000 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Steps List */}
      <div className="w-full space-y-4">
        {steps.map((step) => {
          // @ts-ignore
          const currentStatus = status ? status[step.key] : 'pending';
          const isActive = currentStatus === 'active';
          const isComplete = currentStatus === 'complete';
          const isPending = currentStatus === 'pending';

          return (
            <div 
              key={step.key}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                isActive 
                  ? 'border-stone-900 bg-white shadow-md scale-105' 
                  : isComplete 
                    ? 'border-green-100 bg-green-50/50' 
                    : 'border-transparent opacity-60'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                isActive ? 'bg-stone-900 text-white' : isComplete ? 'bg-green-500 text-white' : 'bg-stone-100 text-stone-400'
              }`}>
                {isActive ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : isComplete ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <step.icon size={20} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-bold ${isComplete ? 'text-green-800' : 'text-stone-900'}`}>
                  {step.label}
                </h4>
                <p className="text-xs text-stone-500 truncate">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};