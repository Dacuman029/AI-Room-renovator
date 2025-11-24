
import React, { useState } from 'react';
import { Button } from './Button';
import { ArrowRight } from 'lucide-react';

interface PreferencesStepProps {
  onConfirm: (budget: string, stores: string[], existingItems: string) => void;
}

const POPULAR_STORES = [
  { id: 'Amazon.in', name: 'Amazon' },
  { id: 'Flipkart', name: 'Flipkart' },
  { id: 'Meesho', name: 'Meesho' },
  { id: 'Ikea India', name: 'IKEA' },
  { id: 'Myntra', name: 'Myntra' },
  { id: 'Pepperfry', name: 'Pepperfry' }
];

const BUDGET_PRESETS = [
  { label: '₹10k', value: '10000' },
  { label: '₹25k', value: '25000' },
  { label: '₹50k', value: '50000' },
  { label: '₹1L', value: '100000' },
  { label: '₹2L+', value: '200000' }
];

export const PreferencesStep: React.FC<PreferencesStepProps> = ({ onConfirm }) => {
  const [budget, setBudget] = useState('');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [existingItems, setExistingItems] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toggleStore = (storeId: string) => {
    setSelectedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleSubmit = () => {
    if (!budget) {
      setError("Please specify a budget.");
      return;
    }
    const budgetNum = parseInt(budget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      setError("Invalid budget.");
      return;
    }
    onConfirm(budget, selectedStores, existingItems);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 space-y-8">
      
      {/* Budget */}
      <div>
        <div className="relative">
          <input
            type="number"
            value={budget}
            onChange={(e) => {
               setBudget(e.target.value);
               if(e.target.value) setError(null);
            }}
            placeholder=" "
            className={`peer w-full px-4 pt-6 pb-2 rounded-t-2xl border-b-2 bg-[#F3F4F6] outline-none text-[#1C1B1F] text-lg font-medium transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-stone-300 focus:border-[#6750A4] focus:bg-[#E8DEF8]/30'}`}
          />
          <label className="absolute left-4 top-4 text-[#49454F] text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#6750A4] font-medium">
            Total Budget (INR) *
          </label>
        </div>
        {error && <p className="text-red-500 text-xs mt-1 px-4 font-medium">{error}</p>}
        
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide px-1">
          {BUDGET_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setBudget(preset.value)}
              className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200 active:scale-95 ${
                budget === preset.value
                  ? 'bg-[#1C1B1F] text-white border-[#1C1B1F] shadow-lg shadow-black/10'
                  : 'bg-white text-[#49454F] border-[#E5E7EB]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stores */}
      <div>
        <h3 className="text-sm font-bold text-[#49454F] mb-3 px-1 uppercase tracking-wider">Preferred Stores</h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_STORES.map((store) => (
            <button
              key={store.id}
              onClick={() => toggleStore(store.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 border ${
                selectedStores.includes(store.id)
                  ? 'bg-[#E8DEF8] text-[#1D192B] border-[#E8DEF8]'
                  : 'bg-white text-[#49454F] border-[#E5E7EB]'
              }`}
            >
              {store.name}
            </button>
          ))}
        </div>
      </div>

      {/* Existing Items */}
      <div>
        <h3 className="text-sm font-bold text-[#49454F] mb-2 px-1 uppercase tracking-wider">Keep Existing Items</h3>
        <textarea
          value={existingItems}
          onChange={(e) => setExistingItems(e.target.value)}
          placeholder="E.g. The beige sofa, wooden coffee table..."
          className="w-full p-4 rounded-3xl border border-transparent bg-white shadow-sm focus:ring-2 focus:ring-[#6750A4] outline-none h-28 text-[#1C1B1F] text-sm resize-none"
        />
      </div>

      {/* FAB Action */}
      <div className="fixed bottom-24 right-4 z-40">
        <div className="shadow-2xl rounded-2xl">
          <Button 
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            icon={<ArrowRight size={20} />}
            // Render icon on right by swapping children order or generic
            className="flex-row-reverse"
          >
            See Results
          </Button>
        </div>
      </div>

    </div>
  );
};
