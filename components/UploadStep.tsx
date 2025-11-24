import React, { useCallback } from 'react';
import { Camera, Upload } from 'lucide-react';
import { RoomType, RoomLocationOption } from '../types';

interface UploadStepProps {
  onImageSelect: (base64: string) => void;
  onTypeSelect: (type: RoomType) => void;
  selectedType: RoomType;
  onLocationSelect: (locations: string[]) => void;
  selectedLocations: string[];
  onSizeChange: (size: string) => void;
  roomSize: string;
  onPurposeChange: (purpose: string) => void;
  roomPurpose: string;
  title: string;
  subtitle: string;
}

const ROOM_LOCATIONS: RoomLocationOption[] = [
  'Living Room', 'Bedroom', 'Kitchen', 'Dining Room', 
  'Bathroom', 'Home Office', 'Art Studio', 'Gaming Room',
  'Balcony', 'Entryway', 'Guest Room', 'Other'
];

export const UploadStep: React.FC<UploadStepProps> = ({ 
  onImageSelect, 
  onTypeSelect, 
  selectedType,
  onLocationSelect,
  selectedLocations,
  onSizeChange,
  roomSize,
  onPurposeChange,
  roomPurpose
}) => {
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
      onLocationSelect(selectedLocations.filter(l => l !== loc));
    } else {
      if (selectedLocations.length < 3) {
        onLocationSelect([...selectedLocations, loc]);
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-24">
      
      {/* Scope Section */}
      <section>
        <h2 className="text-lg font-serif font-semibold text-[#27474e] mb-3">Select Your Scope</h2>
        <div className="flex h-12 w-full items-center justify-center rounded-lg bg-[#f1eae4] p-1">
          <button
            onClick={() => onTypeSelect('whole_room')}
            className={`flex h-full flex-1 cursor-pointer items-center justify-center rounded-md px-2 transition-all duration-200 ${
              selectedType === 'whole_room'
                ? 'bg-white text-[#27474e] shadow-sm font-semibold'
                : 'text-[#27474e]/70 font-medium hover:text-[#27474e]'
            }`}
          >
            Whole Room
          </button>
          <button
            onClick={() => onTypeSelect('single_wall')}
            className={`flex h-full flex-1 cursor-pointer items-center justify-center rounded-md px-2 transition-all duration-200 ${
              selectedType === 'single_wall'
                ? 'bg-white text-[#27474e] shadow-sm font-semibold'
                : 'text-[#27474e]/70 font-medium hover:text-[#27474e]'
            }`}
          >
            Single Wall
          </button>
        </div>
      </section>

      {/* Room Type Section */}
      <section>
        <div className="flex justify-between items-baseline mb-3">
          <h2 className="text-lg font-serif font-semibold text-[#27474e]">Choose Room Type</h2>
          <span className="text-xs text-[#27474e]/60 font-medium">Max 3</span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {ROOM_LOCATIONS.map((loc) => {
            const isSelected = selectedLocations.includes(loc);
            return (
              <button
                key={loc}
                onClick={() => toggleLocation(loc)}
                className={`h-10 px-5 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center active:scale-95 ${
                  isSelected
                    ? 'bg-[#b9956a] text-white shadow-md' // Camel
                    : 'bg-[#f1eae4] text-[#27474e]/70 hover:bg-[#eaddd5]' // Foghorn
                }`}
              >
                {loc}
              </button>
            );
          })}
        </div>
      </section>

      {/* Details Section */}
      <section>
        <h2 className="text-lg font-serif font-semibold text-[#27474e] mb-4">Add Details</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#27474e]/80 block mb-1">Room Size</label>
            <input
              type="text"
              value={roomSize}
              onChange={(e) => onSizeChange(e.target.value)}
              placeholder="e.g., 200 sq ft or 10x12"
              className="block w-full rounded-lg border border-[#f1eae4] bg-white py-2.5 px-3 text-[#27474e] shadow-sm placeholder-[#27474e]/40 focus:border-[#b9956a] focus:ring-1 focus:ring-[#b9956a] outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#27474e]/80 block mb-1">Primary Purpose</label>
            <input
              type="text"
              value={roomPurpose}
              onChange={(e) => onPurposeChange(e.target.value)}
              placeholder="e.g., Relaxation, Working"
              className="block w-full rounded-lg border border-[#f1eae4] bg-white py-2.5 px-3 text-[#27474e] shadow-sm placeholder-[#27474e]/40 focus:border-[#b9956a] focus:ring-1 focus:ring-[#b9956a] outline-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* Action Section */}
      <section className="pt-2 sticky bottom-24 z-10">
        <h2 className="text-lg font-serif font-semibold text-[#27474e] mb-3">Get Inspired</h2>
        <div className={`relative flex h-40 flex-col items-center justify-center space-y-2 rounded-xl text-white shadow-lg transition-all duration-300 active:scale-[0.98] overflow-hidden group ${
             selectedLocations.length === 0 ? 'bg-stone-300 grayscale cursor-not-allowed' : 'bg-gradient-to-br from-[#6e293c] to-[#8c354e] cursor-pointer'
        }`}>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            disabled={selectedLocations.length === 0}
            className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
            aria-label="Upload an inspiration photo"
          />

          <div className={`transition-transform duration-300 ${selectedLocations.length > 0 ? 'group-hover:scale-110' : ''}`}>
             <Camera size={40} className="text-white/90" strokeWidth={1.5} />
          </div>
          
          <p className="font-semibold text-white/90">Upload a Photo to Start</p>
        </div>
        
        {selectedLocations.length === 0 && (
          <p className="text-center text-xs text-[#6e293c] mt-3 font-medium">
            Please select a room type first
          </p>
        )}
      </section>

    </div>
  );
};