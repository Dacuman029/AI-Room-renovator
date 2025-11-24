import { SavedDesign } from '../types';

const STORAGE_KEY = 'pinterestify_designs';

export const saveDesign = (design: Omit<SavedDesign, 'id' | 'timestamp'>): SavedDesign | null => {
  try {
    const designs = getSavedDesigns();
    
    // Create new design object
    const newDesign: SavedDesign = {
      ...design,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      timestamp: Date.now(),
    };

    // Prepend to keep newest first
    const updatedDesigns = [newDesign, ...designs];

    // Try to save to local storage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDesigns));
      return newDesign;
    } catch (e) {
      // If quota exceeded, try removing the oldest item
      if (designs.length > 0) {
        console.warn("Storage quota exceeded, removing oldest design");
        const truncatedDesigns = [newDesign, ...designs.slice(0, -1)];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(truncatedDesigns));
        return newDesign;
      } else {
        throw e;
      }
    }
  } catch (error) {
    console.error("Failed to save design to local storage:", error);
    return null;
  }
};

export const getSavedDesigns = (): SavedDesign[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load designs:", e);
    return [];
  }
};

export const deleteDesign = (id: string): SavedDesign[] => {
  try {
    const designs = getSavedDesigns().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
    return designs;
  } catch (error) {
    console.error("Failed to delete design:", error);
    return [];
  }
};