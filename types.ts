
export interface ProductRecommendation {
  name: string;
  description: string;
  priceEstimate: string;
  searchQuery: string;
  category: string;
  coordinates?: { x: number; y: number }; // 0-100 percentages
}

export interface RenovationAnalysis {
  styleAnalysis: string;
  colorPalette: string[];
  designTips: string[];
  functionalAdditions: string[]; // New field for extra functional suggestions
  products: ProductRecommendation[];
}

export type RoomType = 'whole_room' | 'single_wall';

export type RoomLocationOption = 'Living Room' | 'Bedroom' | 'Kitchen' | 'Dining Room' | 'Bathroom' | 'Home Office' | 'Balcony' | 'Entryway' | 'Art Studio' | 'Gaming Room' | 'Guest Room' | 'Other';

export interface SavedDesign {
  id: string;
  timestamp: number;
  originalImage: string;
  inspirationImage: string | null;
  style: string;
  roomType: RoomType;
  roomLocation: string[]; // Changed to array for multi-purpose
  roomSize?: string;
  roomPurpose?: string;
  generatedImage: string;
  analysisData: RenovationAnalysis;
  budget?: string;
  preferredStores?: string[];
  existingFurniture?: string;
}

export interface AppState {
  step: 'upload' | 'style' | 'preferences' | 'processing' | 'results' | 'history';
  originalImage: string | null; // base64
  inspirationImage: string | null; // base64
  selectedStyle: string; // text description
  roomType: RoomType;
  roomLocation: string[]; // Changed to array
  roomSize: string;
  roomPurpose: string;
  generatedImage: string | null; // base64
  analysisData: RenovationAnalysis | null;
  error: string | null;
  budget: string;
  preferredStores: string[];
  existingFurniture: string;
}

export enum RenovationStyle {
  MODERN_MINIMALIST = "Modern Minimalist",
  BOHEMIAN_CHIC = "Bohemian Chic",
  SCANDINAVIAN = "Scandinavian",
  INDUSTRIAL = "Industrial Loft",
  MID_CENTURY_MODERN = "Mid-Century Modern",
  FARMHOUSE = "Modern Farmhouse",
  JAPANDI = "Japandi",
  ART_DECO = "Art Deco"
}

export const STYLE_PROMPTS: Record<RenovationStyle, string> = {
  [RenovationStyle.MODERN_MINIMALIST]: "Clean lines, neutral color palette, uncluttered spaces, functional furniture, glass and steel accents.",
  [RenovationStyle.BOHEMIAN_CHIC]: "Eclectic mix of patterns, textures, plants, vintage furniture, warm earthy tones, relaxed atmosphere.",
  [RenovationStyle.SCANDINAVIAN]: "Simplicity, functionality, bright whites, natural light, wood textures, cozy textiles (hygge).",
  [RenovationStyle.INDUSTRIAL]: "Exposed brick, metal fixtures, raw wood, concrete floors, open concept, utilitarian aesthetic.",
  [RenovationStyle.MID_CENTURY_MODERN]: "Organic shapes, tapered legs, bold accent colors, natural woods, geometric patterns.",
  [RenovationStyle.FARMHOUSE]: "Rustic charm, shiplap walls, distressed wood, cozy fabrics, neutral tones, vintage accessories.",
  [RenovationStyle.JAPANDI]: "Hybrid of Japanese rustic minimalism and Scandinavian functionality. Clean lines, bright spaces, light wood.",
  [RenovationStyle.ART_DECO]: "Bold geometric shapes, rich colors, luxurious fabrics like velvet, gold and brass accents, glamour."
};
