import { GoogleGenAI } from "@google/genai";
import { ProductResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Parser to convert the structured text response into ProductResult objects
const parseProductResponse = (text: string): ProductResult[] => {
  const lines = text.split('\n');
  const results: ProductResult[] = [];

  for (const line of lines) {
    // Regex to match the strict format requested:
    // STORE: [Name] | PRICE: [123.00] | CURRENCY: [SAR] | LINK: [URL] | NOTES: [Notes]
    const match = line.match(/STORE:\s*(.*?)\s*\|\s*PRICE:\s*(.*?)\s*\|\s*CURRENCY:\s*(.*?)\s*\|\s*LINK:\s*(.*?)\s*\|\s*NOTES:\s*(.*)/i);
    
    if (match) {
      results.push({
        storeName: match[1].trim(),
        price: match[2].trim(),
        currency: match[3].trim(),
        url: match[4].trim(),
        notes: match[5].trim(),
        isCheapest: false // Will calculate later
      });
    }
  }

  // Determine cheapest
  if (results.length > 0) {
    // Basic heuristic to sort by price (removing non-numeric chars)
    results.sort((a, b) => {
      const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || Infinity;
      const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || Infinity;
      return priceA - priceB;
    });
    
    if (results[0]) {
      results[0].isCheapest = true;
    }
  }

  return results;
};

export const findCheapestProduct = async (
  query: string, 
  imageBase64?: string
): Promise<{ results: ProductResult[], rawText: string, links: string[] }> => {
  
  const model = 'gemini-2.5-flash';
  
  // Instructions updated to strictly require Saudi Riyals (SAR) and Saudi market focus
  const promptText = `
    You are a helpful shopping assistant for a user in Saudi Arabia.
    Task: Find the current cheapest online prices for the product described below.
    Product: "${query}"
    
    1. Search the web using Google Search to find real, current prices.
    2. Focus ONLY on stores that ship to Saudi Arabia (e.g., Amazon SA, Noon, Jarir, Extra, Nice One, or major global sites shipping to KSA).
    3. IMPORTANT: All prices MUST be in Saudi Riyals (SAR / ر.س). If a price is in USD, convert it to SAR.
    4. Identify at least 4-5 different online stores selling this product.
    5. STRICTLY output the results in the following specific format for each store (one per line). Do not use Markdown tables.
    
    Format:
    STORE: [Store Name] | PRICE: [Numeric Price Only] | CURRENCY: ر.س | LINK: [Direct URL] | NOTES: [Short note in Arabic, e.g., شامل الضريبة, توصيل مجاني]

    6. If you cannot find exact prices, provide a helpful summary in Arabic text.
  `;

  const parts: any[] = [{ text: promptText }];
  
  if (imageBase64) {
    parts.unshift({
      inlineData: {
        mimeType: 'image/jpeg', // Assuming jpeg for simplicity, valid for png too usually
        data: imageBase64
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType is NOT supported with tools, so we parse text manually
      }
    });

    const text = response.text || "";
    const parsedResults = parseProductResponse(text);

    // Extract grounding chunks for display
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links: string[] = [];
    
    groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
            links.push(chunk.web.uri);
        }
    });

    return {
      results: parsedResults,
      rawText: text, // Fallback if parsing fails
      links: Array.from(new Set(links)) // Unique links
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};