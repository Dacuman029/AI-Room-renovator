
import { GoogleGenAI, Type } from "@google/genai";
import { RenovationAnalysis, RenovationStyle, RoomType, ProductRecommendation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to strip base64 prefix
const stripBase64 = (base64: string) => base64.split(',')[1] || base64;

export const analyzeRoom = async (
  roomImage: string,
  style: string,
  roomType: RoomType,
  roomLocations: string[],
  roomSize: string,
  roomPurpose: string,
  inspirationImage?: string | null,
  preferences?: {
    budget: string;
    stores: string[];
    existingItems: string;
  }
): Promise<RenovationAnalysis> => {
  try {
    const parts: any[] = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: stripBase64(roomImage),
        },
      },
    ];

    if (inspirationImage) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: stripBase64(inspirationImage),
        },
      });
      parts.push({ text: `Use the second image as specific inspiration for the style.` });
    }

    const locationsStr = roomLocations.join(' + ');
    const typeContext = roomType === 'whole_room' 
      ? "the entire room"
      : "this specific wall or corner";

    let prompt = `
      You are an expert Indian interior designer.
      Analyze the first image.
      
      CONTEXT:
      - Room Function(s): ${locationsStr} (Multi-functional space).
      - Room Size: ${roomSize || "Standard"}.
      - Primary Usage/Purpose: ${roomPurpose || "General living"}.
      - Renovation Scope: ${typeContext}.
      - Style Goal: "${style}".
    `;

    if (preferences) {
      if (preferences.budget) {
        // Normalize budget string to number
        const budgetNum = parseInt(preferences.budget.replace(/[^0-9]/g, '')) || 0;
        
        prompt += `
        \nCRITICAL BUDGET CONSTRAINT: The user has a STRICT total budget of ₹${preferences.budget} INR. 
        You must suggest 5 products that are ABSOLUTELY ESSENTIAL for the look.
        The SUM of the estimated prices of these 5 products MUST NOT exceed ₹${preferences.budget}.
        `;

        // Granular Budget Logic
        if (budgetNum <= 15000) {
          prompt += `
          \nMICRO BUDGET SCENARIO (< ₹15k):
          - STRICT RULE: DO NOT suggest furniture (No chairs, tables, cabinets).
          - Suggest ONLY: Cushion covers, wall posters, small plants, fairy lights, or a very small rug.
          - Strategy: Focus on decluttering and adding small pops of color.
          - If the user asked for a sofa change, IGNORE IT and say it's not possible within budget.
          `;
        } else if (budgetNum <= 50000) {
          prompt += `
          \nLOW BUDGET SCENARIO (< ₹50k):
          - Focus on: Rugs, curtains, lamps, throw pillows, bedding.
          - Allowed Furniture: Maximum 1 small item (e.g. side table, pouf, shoe rack) under ₹5,000.
          - DO NOT suggest: Sofas, Beds, Wardrobes, Dining Tables.
          `;
        } else if (budgetNum <= 150000) {
          prompt += `
          \nMID BUDGET SCENARIO (< ₹1.5L):
          - Allowed: 1-2 key furniture pieces (e.g. Coffee table, Accent chair, Bookshelf).
          - Decor: Premium lighting, large area rugs.
          - Keep the main Sofa/Bed unless it's the ONLY thing being bought.
          `;
        } else {
          prompt += `
          \nHIGH BUDGET SCENARIO:
          - You may suggest larger furniture replacements if they fit the style.
          - Focus on high-quality materials and statement pieces.
          `;
        }
      }
      
      if (preferences.stores && preferences.stores.length > 0) {
        prompt += `\nPrioritize finding products available on these stores: ${preferences.stores.join(', ')}.`;
      } else {
        prompt += `\nSuggest products widely available in the Indian online marketplace (Amazon.in, Flipkart, Meesho, Ikea India).`;
      }

      if (preferences.existingItems) {
        prompt += `\nThe user wants to KEEP the following existing items: "${preferences.existingItems}". Your design MUST incorporate these. Do not suggest replacing them.`;
      }
    }
      
    prompt += `
      Provide a structured renovation plan including:
      1. A short analysis of how to optimize this ${roomSize} space for ${locationsStr}, addressing the user's purpose: "${roomPurpose}".
      2. A color palette of 5 hex codes.
      3. 4-5 specific, actionable design tips.
      4. A list of 'functionalAdditions': 2-3 items/ideas that would add *extra* utility to the room (e.g. "A clip-on reading light", "Under-desk cable organizer") that are optional upgrades if they had more budget.
      5. A list of 5 specific products to buy within the budget. 
         For each product:
         - 'name': A generic but searchable product name.
         - 'searchQuery': A highly optimized search term for Amazon India or Flipkart.
         - 'priceEstimate': A realistic market price in INR.
         - 'category': The type of item.
    `;

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styleAnalysis: { type: Type.STRING },
            colorPalette: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of hex color codes"
            },
            designTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            functionalAdditions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Suggestions for extra functional items or improvements beyond the core budget"
            },
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priceEstimate: { type: Type.STRING, description: "Estimated price in INR (e.g. ₹2,500)" },
                  searchQuery: { type: Type.STRING, description: "Optimized Google Shopping/Amazon search query" },
                  category: { type: Type.STRING, description: "e.g., Furniture, Lighting, Decor" }
                }
              }
            }
          }
        }
      }
    });

    if (!response.text) throw new Error("No analysis generated");
    return JSON.parse(response.text) as RenovationAnalysis;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const visualizeRoom = async (
  roomImage: string,
  style: string,
  roomType: RoomType,
  roomLocations: string[],
  roomSize: string,
  roomPurpose: string,
  inspirationImage?: string | null,
  existingItems?: string,
  budget?: string
): Promise<string> => {
  try {
    const parts: any[] = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: stripBase64(roomImage),
        },
      },
    ];

    let textPrompt = "";
    const locationsStr = roomLocations.join(' combined with ');

    // Add budget realism context to the visualization
    let budgetContext = "";
    if (budget) {
      const budgetNum = parseInt(budget.replace(/[^0-9]/g, '')) || 0;
      
      if (budgetNum < 20000) {
        budgetContext = `
        STRICT LOW BUDGET CONSTRAINT:
        - DO NOT CHANGE THE ROOM STRUCTURE. 
        - DO NOT REPLACE LARGE FURNITURE (Sofa, Bed, Wardrobes must stay same).
        - ONLY CHANGE: Wall color, Rugs, Curtains, Throw Pillows, Plants, Wall Art.
        - The room should look like a DIY makeover, not a luxury remodel.
        - Keep the flooring exactly as is.
        `;
      } else if (budgetNum < 100000) {
        budgetContext = `
        MID-RANGE BUDGET CONSTRAINT:
        - Keep the flooring and ceiling as is.
        - You can update small furniture (coffee table, chairs).
        - Use practical, accessible decor (IKEA/Pepperfry style).
        - Avoid luxury materials like marble or gold unless they exist in original.
        `;
      } else {
        budgetContext = "HIGH BUDGET: Premium finishes, custom lighting, new furniture allowed.";
      }
    }

    if (roomType === 'whole_room') {
      textPrompt = `
        Redesign this room as a ${locationsStr}.
        Style: "${style}".
        Size: ${roomSize}. Purpose: ${roomPurpose}.
        ${budgetContext}
        
        Maintain strict realism. This is a renovation visualization.
        Only show products that fit within the budget description above.
        Maintain the exact room structure (windows, doors, ceiling height) and perspective.
      `;
    } else {
      textPrompt = `
        Redesign this specific wall area for ${locationsStr}.
        Style: "${style}".
        ${budgetContext}
        Update wall treatments and decor only.
      `;
    }

    if (existingItems) {
      textPrompt += ` The user has existing items described as: "${existingItems}". You MUST preserve items matching this description in the generated image. Blend them into the new design.`;
    }

    textPrompt += `
      Make it look like a real photo taken with a smartphone or DSLR in a real Indian home.
      Realistic lighting and textures. Avoid hyper-realistic AI gloss.
    `;

    if (inspirationImage) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: stripBase64(inspirationImage),
        },
      });
      textPrompt += ` Use the second image as a visual reference for the color scheme and vibe.`;
    }

    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image", 
      contents: { parts },
      config: {
        // generateContent with image input works for image-to-image style transfer tasks
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image generated");

  } catch (error) {
    console.error("Visualization failed:", error);
    throw error;
  }
};

export const detectProductCoordinates = async (
  generatedImage: string,
  products: ProductRecommendation[],
  style?: string
): Promise<ProductRecommendation[]> => {
  try {
    const productNames = products.map(p => p.name).join(', ');
    
    const parts: any[] = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: stripBase64(generatedImage),
        },
      },
      {
        text: `
          Look at this room image. The room is designed in the style: "${style || 'Modern'}".
          I have a list of products that should be in this room: [${productNames}].
          
          For each product in the list that you can visibly find in the image, identify its 2D coordinate center.
          
          Return a JSON array of objects. Each object must have:
          - 'name': The exact name from my list.
          - 'found': boolean, true if found.
          - 'y_min': number (0-1000 scale), top boundary.
          - 'x_min': number (0-1000 scale), left boundary.
          - 'y_max': number (0-1000 scale), bottom boundary.
          - 'x_max': number (0-1000 scale), right boundary.
          
          IMPORTANT: Only mark 'found: true' if the item is CLEARLY visible in the image. Do not guess.
        `
      }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              found: { type: Type.BOOLEAN },
              y_min: { type: Type.INTEGER },
              x_min: { type: Type.INTEGER },
              y_max: { type: Type.INTEGER },
              x_max: { type: Type.INTEGER },
            }
          }
        }
      }
    });

    if (!response.text) return products;

    const detections = JSON.parse(response.text);
    
    // Merge coordinates into original products
    return products.map(product => {
      const match = detections.find((d: any) => d.name === product.name && d.found);
      if (match) {
        // Calculate center percentage (0-100)
        const centerY = ((match.y_min + match.y_max) / 2) / 10;
        const centerX = ((match.x_min + match.x_max) / 2) / 10;
        return { ...product, coordinates: { x: centerX, y: centerY } };
      }
      return product;
    });

  } catch (error) {
    console.warn("Product detection failed:", error);
    return products; // Return original products without coordinates if detection fails
  }
};
