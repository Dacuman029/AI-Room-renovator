import React, { useState, useEffect } from 'react';
import { AppState, SavedDesign, RoomType } from './types';
import { analyzeRoom, visualizeRoom, detectProductCoordinates } from './services/geminiService';
import { saveDesign, getSavedDesigns, deleteDesign } from './services/storageService';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { UploadStep } from './components/UploadStep';
import { StyleSelectionStep } from './components/StyleSelectionStep';
import { PreferencesStep } from './components/PreferencesStep';
import { ProcessingStep } from './components/ProcessingStep';
import { ResultsStep } from './components/ResultsStep';
import { HistoryStep } from './components/HistoryStep';

const INITIAL_STATE: AppState = {
  step: 'upload',
  originalImage: null,
  inspirationImage: null,
  selectedStyle: '',
  roomType: 'whole_room',
  roomLocation: [], 
  roomSize: '',
  roomPurpose: '',
  generatedImage: null,
  analysisData: null,
  error: null,
  budget: '',
  preferredStores: [],
  existingFurniture: ''
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  const [processingStatus, setProcessingStatus] = useState<{
    analysis: 'pending' | 'active' | 'complete';
    vision: 'pending' | 'active' | 'complete';
    polishing: 'pending' | 'active' | 'complete';
  }>({
    analysis: 'pending',
    vision: 'pending',
    polishing: 'pending'
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                              (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    
    checkStandalone();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    window.history.replaceState({ step: 'upload' }, '', '');

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.step) {
        setState(prev => ({ ...prev, step: event.state.step }));
      } else {
        setState(prev => ({ ...prev, step: 'upload' }));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToStep = (newStep: AppState['step']) => {
    window.history.pushState({ step: newStep }, '', '');
    setState(prev => ({ ...prev, step: newStep }));
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    if (state.step === 'history') {
      setSavedDesigns(getSavedDesigns());
    }
  }, [state.step]);

  const handleRoomUpload = (base64: string) => {
    setState(prev => ({ ...prev, originalImage: base64 }));
    navigateToStep('style');
  };

  const handleTypeSelect = (type: RoomType) => {
    setState(prev => ({ ...prev, roomType: type }));
  };

  const handleLocationSelect = (locations: string[]) => {
    setState(prev => ({ ...prev, roomLocation: locations }));
  };

  const handleSizeChange = (size: string) => {
    setState(prev => ({ ...prev, roomSize: size }));
  };

  const handlePurposeChange = (purpose: string) => {
    setState(prev => ({ ...prev, roomPurpose: purpose }));
  };

  const handleStyleConfirm = (style: string, inspirationImage: string | null) => {
    setState(prev => ({ 
      ...prev, 
      selectedStyle: style, 
      inspirationImage
    }));
    navigateToStep('preferences');
  };

  const handlePreferencesConfirm = async (budget: string, stores: string[], existingItems: string) => {
    setState(prev => ({
      ...prev,
      budget,
      preferredStores: stores,
      existingFurniture: existingItems,
    }));
    navigateToStep('processing');

    setProcessingStatus({
      analysis: 'active',
      vision: 'active',
      polishing: 'pending'
    });

    try {
      if (!state.originalImage) throw new Error("No room image found");

      const preferences = {
        budget,
        stores,
        existingItems
      };

      const analysisPromise = analyzeRoom(
        state.originalImage, 
        state.selectedStyle, 
        state.roomType, 
        state.roomLocation,
        state.roomSize,
        state.roomPurpose,
        state.inspirationImage, 
        preferences
      ).then(res => {
        setProcessingStatus(prev => ({ ...prev, analysis: 'complete' }));
        return res;
      });

      const visualizePromise = visualizeRoom(
        state.originalImage, 
        state.selectedStyle, 
        state.roomType, 
        state.roomLocation,
        state.roomSize,
        state.roomPurpose,
        state.inspirationImage, 
        existingItems,
        budget
      ).then(res => {
        setProcessingStatus(prev => ({ ...prev, vision: 'complete' }));
        return res;
      });

      const [analysis, visualizedImage] = await Promise.all([
        analysisPromise,
        visualizePromise
      ]);

      setProcessingStatus(prev => ({ ...prev, polishing: 'active' }));

      let productsWithCoordinates = analysis.products;
      try {
        productsWithCoordinates = await detectProductCoordinates(
          visualizedImage, 
          analysis.products,
          state.selectedStyle
        );
        analysis.products = productsWithCoordinates;
      } catch (detectionError) {
        console.warn("Could not detect product coordinates", detectionError);
      }
      
      setProcessingStatus(prev => ({ ...prev, polishing: 'complete' }));

      try {
        saveDesign({
          originalImage: state.originalImage,
          inspirationImage: state.inspirationImage,
          style: state.selectedStyle,
          roomType: state.roomType,
          roomLocation: state.roomLocation,
          roomSize: state.roomSize,
          roomPurpose: state.roomPurpose,
          generatedImage: visualizedImage,
          analysisData: analysis,
          budget,
          preferredStores: stores,
          existingFurniture: existingItems
        });
      } catch (saveError) {
        console.warn("Could not save design to history", saveError);
      }

      setTimeout(() => {
        setState(prev => ({
          ...prev,
          analysisData: analysis,
          generatedImage: visualizedImage
        }));
        navigateToStep('results');
      }, 600);

    } catch (error: any) {
      console.error("Processing error", error);
      setState(prev => ({
        ...prev,
        error: "Something went wrong. Please try again.",
      }));
      navigateToStep('style');
    }
  };

  const handleReset = () => {
    setState(INITIAL_STATE);
    window.history.pushState({ step: 'upload' }, '', '');
  };

  const handleHomeClick = () => {
    if (state.step !== 'upload') {
      setState(INITIAL_STATE);
      window.history.pushState({ step: 'upload' }, '', '');
    }
  };

  const handleHistoryClick = () => {
    setState(prev => ({ ...prev, error: null }));
    navigateToStep('history');
  };

  const handleLoadDesign = (design: SavedDesign) => {
    setState({
      step: 'results',
      originalImage: design.originalImage,
      inspirationImage: design.inspirationImage,
      selectedStyle: design.style,
      roomType: design.roomType || 'whole_room',
      roomLocation: design.roomLocation || [],
      roomSize: design.roomSize || '',
      roomPurpose: design.roomPurpose || '',
      generatedImage: design.generatedImage,
      analysisData: design.analysisData,
      error: null,
      budget: design.budget || '',
      preferredStores: design.preferredStores || [],
      existingFurniture: design.existingFurniture || ''
    });
    window.history.pushState({ step: 'results' }, '', '');
  };

  const handleDeleteDesign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this design?")) {
      const updated = deleteDesign(id);
      setSavedDesigns(updated);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-[#faf7f7] font-sans text-[#27474e]">
      <Header 
        onHomeClick={handleHomeClick} 
        onHistoryClick={handleHistoryClick}
        currentStep={state.step}
        onInstallClick={handleInstallClick}
        canInstall={!!deferredPrompt && !isStandalone}
        onBack={state.step !== 'upload' ? handleBack : undefined}
      />
      
      {/* Main Content Area - Mobile Optimized */}
      <main className="pt-16 pb-24 px-4 max-w-lg mx-auto w-full min-h-screen">
        
        {state.error && (
           <div className="bg-red-50 text-red-800 p-4 rounded-xl mb-6 text-center border border-red-100 text-sm font-medium">
             {state.error}
           </div>
        )}

        {state.step === 'upload' && (
             <UploadStep 
               onImageSelect={handleRoomUpload} 
               onTypeSelect={handleTypeSelect}
               selectedType={state.roomType}
               onLocationSelect={handleLocationSelect}
               selectedLocations={state.roomLocation}
               onSizeChange={handleSizeChange}
               roomSize={state.roomSize}
               onPurposeChange={handlePurposeChange}
               roomPurpose={state.roomPurpose}
               title="Renovate" 
               subtitle="Transform your space"
             />
        )}

        {state.step === 'style' && (
          <StyleSelectionStep onConfirm={handleStyleConfirm} />
        )}

        {state.step === 'preferences' && (
          <PreferencesStep onConfirm={handlePreferencesConfirm} />
        )}

        {state.step === 'processing' && (
          <ProcessingStep status={processingStatus} />
        )}

        {state.step === 'results' && (
          <ResultsStep state={state} onReset={handleReset} />
        )}

        {state.step === 'history' && (
          <HistoryStep 
            designs={savedDesigns} 
            onSelectDesign={handleLoadDesign}
            onDeleteDesign={handleDeleteDesign}
            onNewDesign={handleReset}
          />
        )}

      </main>

      <BottomNav 
        currentStep={state.step}
        onHomeClick={handleHomeClick}
        onHistoryClick={handleHistoryClick}
        onNewDesignClick={handleReset}
        onInstallClick={handleInstallClick}
        canInstall={!!deferredPrompt && !isStandalone}
      />
    </div>
  );
};

export default App;