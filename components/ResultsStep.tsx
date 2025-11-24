
import React, { useState, useRef, useEffect } from 'react';
import { AppState, ProductRecommendation } from '../types';
import { ArrowRight, ShoppingBag, Download, RefreshCw, Tag, Lightbulb, CheckCircle2, Copy, Check, SplitSquareHorizontal, Eye, GripVertical, Smartphone, X, Share2, Loader2, Sofa, Lamp, Palette, Flower2, Armchair, BedDouble, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from './Button';

interface ResultsStepProps {
  state: AppState;
  onReset: () => void;
}

const DesignTipItem: React.FC<{ tip: string; index: number }> = ({ tip, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tip).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <li className="flex items-start gap-3 text-sm text-[#49454F] leading-relaxed group py-3 border-b border-[#F3F4F6] last:border-0 active:bg-stone-50 rounded-lg px-2 -mx-2 transition-colors">
      <span className="bg-[#E8DEF8] text-[#1D192B] font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs mt-0.5">{index + 1}</span>
      <span className="flex-1">{tip}</span>
      <button 
        onClick={handleCopy}
        className="text-stone-400 p-2 active:text-[#6750A4]"
      >
        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
      </button>
    </li>
  );
};

const ColorSwatch: React.FC<{ color: string }> = ({ color }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(color).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(console.error);
  };

  return (
    <button 
      onClick={handleCopy}
      className="flex flex-col gap-2 items-center group relative"
      title="Copy Hex Code"
    >
       <div 
         className="w-14 h-14 rounded-2xl shadow-sm border border-black/5 relative overflow-hidden transition-transform active:scale-95 flex items-center justify-center" 
         style={{ backgroundColor: color }}
       >
          {copied && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center animate-in fade-in duration-200">
               <Check size={18} className="text-white drop-shadow-md" strokeWidth={3} />
            </div>
          )}
          {!copied && (
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          )}
       </div>
       <span className="text-[10px] font-bold text-[#49454F] uppercase tracking-wide">{color}</span>
       
       {copied && (
         <span className="absolute -top-8 bg-[#1C1B1F] text-white text-[10px] py-1 px-2 rounded-md animate-in slide-in-from-bottom-2 fade-in z-10 whitespace-nowrap">
           Copied
         </span>
       )}
    </button>
  );
};

export const ResultsStep: React.FC<ResultsStepProps> = ({ state, onReset }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'analysis'>('visual');
  const { generatedImage, originalImage, inspirationImage, analysisData, budget } = state;

  const [hoveredProductIndex, setHoveredProductIndex] = useState<number | null>(null);

  const [showComparison, setShowComparison] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const [activeArProduct, setActiveArProduct] = useState<ProductRecommendation | null>(null);
  const [arLoading, setArLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraSupport, setHasCameraSupport] = useState(false);

  useEffect(() => {
    setHasCameraSupport(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  }, []);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    
    let pos = ((clientX - rect.left) / rect.width) * 100;
    pos = Math.max(0, Math.min(100, pos));
    
    setSliderPosition(pos);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  useEffect(() => {
    let mounted = true;

    if (activeArProduct) {
      setArLoading(true);
      const startCamera = async () => {
        try {
          if (!hasCameraSupport) {
            throw new Error("Camera not supported");
          }

          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          
          if (!mounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          alert("Could not access camera.");
          if (mounted) {
             setActiveArProduct(null);
             setArLoading(false);
          }
        }
      };
      startCamera();
    }

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [activeArProduct, hasCameraSupport]);

  const closeAr = () => {
     setActiveArProduct(null);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Room Renovation',
          text: `Check out my ${budget} room renovation idea!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    const c = category?.toLowerCase() || '';
    if (c.includes('light') || c.includes('lamp') || c.includes('bulb')) return Lamp;
    if (c.includes('plant') || c.includes('flower') || c.includes('pot') || c.includes('vase')) return Flower2;
    if (c.includes('chair') || c.includes('seat') || c.includes('stool')) return Armchair;
    if (c.includes('bed') || c.includes('sleep') || c.includes('mattress') || c.includes('blanket')) return BedDouble;
    if (c.includes('art') || c.includes('decor') || c.includes('frame') || c.includes('rug') || c.includes('curtain')) return Palette;
    if (c.includes('sofa') || c.includes('couch') || c.includes('furniture')) return Sofa;
    return ShoppingBag;
  };

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.8); transform: scale(1); }
          70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); transform: scale(1); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); transform: scale(1); }
        }
        .animate-pulse-ring {
           animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* AR Overlay - Native Camera UI */}
      {activeArProduct && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
          <div className="relative flex-1 bg-black overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${arLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoadedData={() => setArLoading(false)}
            />
            
            {/* Loading State */}
            {arLoading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 bg-stone-900">
                  <Loader2 size={48} className="animate-spin mb-4 text-[#D0BCFF]" />
                  <p className="font-medium tracking-wide">Initializing AR...</p>
               </div>
            )}

            {/* Native Camera Top Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] flex justify-between items-start z-30 bg-gradient-to-b from-black/60 to-transparent pb-12">
               <button onClick={closeAr} className="bg-black/40 text-white p-3 rounded-full backdrop-blur-md active:bg-white/20 transition-colors">
                <X size={24} />
              </button>
              <div className="bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
                 <span className="text-white text-xs font-medium tracking-wider uppercase">AR View</span>
              </div>
              <div className="w-12"></div> {/* Spacer for balance */}
            </div>

            {/* Native Bottom Info Card */}
            {!arLoading && (
                <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-[max(2rem,env(safe-area-inset-bottom))] px-4">
                     <div className="bg-white rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-12 duration-500 mb-4">
                        <div className="flex gap-4 items-center">
                           <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-[#6750A4]">
                              <Smartphone size={24} />
                           </div>
                           <div className="flex-1">
                              <p className="font-bold text-lg text-stone-900 leading-tight">{activeArProduct.name}</p>
                              <p className="text-[#6750A4] font-bold text-sm mt-0.5">{activeArProduct.priceEstimate}</p>
                           </div>
                        </div>
                        <p className="text-stone-500 text-sm mt-3 leading-snug">{activeArProduct.description}</p>
                     </div>
                </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-[#F3F4F6] p-1.5 rounded-2xl mb-6 flex mx-1">
        <button 
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'visual' ? 'bg-white shadow-sm text-[#1D192B]' : 'text-[#49454F] hover:bg-black/5'}`}
          onClick={() => setActiveTab('visual')}
        >
          Visuals
        </button>
        <button 
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'analysis' ? 'bg-white shadow-sm text-[#1D192B]' : 'text-[#49454F] hover:bg-black/5'}`}
          onClick={() => setActiveTab('analysis')}
        >
          Plan & Shop
        </button>
      </div>

      <div className={`${activeTab === 'visual' ? 'block' : 'hidden'}`}>
          <div className="flex justify-between items-center mb-4 px-2">
             <h3 className="text-sm font-bold text-[#49454F] uppercase tracking-wider">Preview</h3>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-[#E8DEF8] text-[#1D192B] px-4 py-2 rounded-full active:scale-95 transition-transform"
              >
                {showComparison ? <Eye size={16} /> : <SplitSquareHorizontal size={16} />}
                {showComparison ? "Hotspots" : "Compare"}
              </button>
          </div>

          <div 
            ref={imageContainerRef}
            className="relative rounded-[32px] overflow-hidden shadow-xl aspect-[3/4] md:aspect-[4/3] bg-stone-100 select-none mb-6 touch-none"
          >
             {generatedImage ? (
                <>
                  <img src={generatedImage} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                  
                  {showComparison && originalImage ? (
                    <>
                      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                         <img src={originalImage} className="absolute inset-0 w-full h-full object-cover" />
                         <div className="absolute bottom-4 left-4 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">ORIGINAL</div>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded z-10">DESIGN</div>
                      
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-white/80 cursor-ew-resize z-30 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                        style={{ left: `${sliderPosition}%` }}
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                      >
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-stone-600 border-4 border-white/50 bg-clip-padding">
                           <div className="flex gap-1">
                              <ChevronLeft size={14} strokeWidth={3} />
                              <ChevronRight size={14} strokeWidth={3} />
                           </div>
                         </div>
                      </div>
                    </>
                  ) : (
                    /* Hotspots */
                    <>
                       {analysisData?.products.map((product, idx) => (
                        product.coordinates && (
                          <div 
                            key={idx}
                            className={`absolute w-12 h-12 -ml-6 -mt-6 cursor-pointer z-20 flex items-center justify-center ${hoveredProductIndex === idx ? 'z-40' : ''}`}
                            style={{ left: `${product.coordinates.x}%`, top: `${product.coordinates.y}%` }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setHoveredProductIndex(hoveredProductIndex === idx ? null : idx);
                            }}
                          >
                             <div className={`w-5 h-5 rounded-full border-[3px] border-white shadow-lg transition-all duration-300 ${hoveredProductIndex === idx ? 'bg-[#6750A4] scale-125' : 'bg-white/90 animate-pulse-ring'}`}></div>
                             
                             {hoveredProductIndex === idx && (
                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl z-30 animate-in zoom-in-95 duration-200">
                                  <p className="font-bold text-sm mb-1 text-[#1D192B] leading-tight">{product.name}</p>
                                  <p className="text-xs text-[#6750A4] font-bold">{product.priceEstimate}</p>
                                  <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45 shadow-sm"></div>
                               </div>
                             )}
                          </div>
                        )
                       ))}
                    </>
                  )}
                  
                  {/* Action overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
                     <button onClick={handleShare} className="bg-white/90 backdrop-blur text-[#1D192B] p-3 rounded-full shadow-lg active:scale-90 transition-transform"><Share2 size={20} /></button>
                     <a href={generatedImage} download="renovation.jpg" className="bg-[#6750A4]/90 backdrop-blur text-white p-3 rounded-full shadow-lg active:scale-90 transition-transform flex items-center justify-center"><Download size={20} /></a>
                  </div>
                </>
             ) : (
                <div className="w-full h-full flex items-center justify-center flex-col text-stone-400 gap-2">
                   <Lightbulb size={32} />
                   <span>Image not available</span>
                </div>
             )}
          </div>
          
          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
              {originalImage && (
                 <div onClick={() => setShowComparison(true)} className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-stone-200 shadow-sm active:scale-95 transition-transform">
                    <img src={originalImage} className="w-full h-full object-cover" />
                 </div>
              )}
              {inspirationImage && (
                 <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-stone-200 shadow-sm">
                    <img src={inspirationImage} className="w-full h-full object-cover" />
                 </div>
              )}
          </div>
      </div>

      <div className={`${activeTab === 'analysis' ? 'block' : 'hidden'} space-y-8 animate-in fade-in duration-300`}>
         
         {/* Color Palette */}
         {analysisData?.colorPalette && analysisData.colorPalette.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
               <h3 className="text-xs font-bold text-[#49454F] uppercase tracking-wider mb-4">Color Palette</h3>
               <div className="flex flex-wrap gap-4">
                  {analysisData.colorPalette.map((color, idx) => (
                     <ColorSwatch key={idx} color={color} />
                  ))}
               </div>
            </div>
         )}
         
         {/* Shopping List */}
         <div>
            <h3 className="text-xs font-bold text-[#49454F] uppercase tracking-wider mb-4 px-2">Shopping List</h3>
            <div className="space-y-4">
               {analysisData?.products.map((product, i) => {
                  const Icon = getCategoryIcon(product.category);
                  return (
                    <div key={i} className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex gap-4 active:scale-[0.99] transition-transform">
                       <div className="w-16 h-16 bg-[#F3F4F6] rounded-2xl flex items-center justify-center text-[#49454F] flex-shrink-0">
                          <Icon size={28} strokeWidth={1.5} />
                       </div>
                       <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <h4 className="text-sm font-bold text-[#1D192B] truncate">{product.name}</h4>
                            <p className="text-xs text-[#49454F] line-clamp-1 mt-0.5">{product.category}</p>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                             <span className="text-sm font-bold text-[#6750A4]">{product.priceEstimate}</span>
                             <div className="flex gap-2">
                                {hasCameraSupport && (
                                   <Button 
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => setActiveArProduct(product)} 
                                      className="!rounded-full !px-3"
                                      title="View in AR"
                                      icon={<Smartphone size={16} />}
                                   >
                                      AR
                                   </Button>
                                )}
                                <Button
                                  variant="black"
                                  size="sm"
                                  onClick={() => window.open(`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(product.searchQuery)}`, '_blank')}
                                  className="!rounded-full !px-4"
                                  icon={<ExternalLink size={14} />}
                                >
                                  Buy
                                </Button>
                             </div>
                          </div>
                       </div>
                    </div>
                  );
               })}
            </div>
         </div>

         {/* Tips */}
         {analysisData?.designTips && (
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
               <h3 className="text-xs font-bold text-[#49454F] uppercase tracking-wider mb-4">Designer Notes</h3>
               <ul className="flex flex-col gap-1">
                 {analysisData.designTips.map((tip, i) => (
                    <DesignTipItem key={i} tip={tip} index={i} />
                 ))}
               </ul>
            </div>
         )}
      </div>

    </div>
  );
};
