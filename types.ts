export interface ProductResult {
  storeName: string;
  price: string;
  currency: string;
  url: string;
  notes: string;
  isCheapest: boolean;
}

export interface SearchState {
  isLoading: boolean;
  results: ProductResult[];
  rawText: string;
  error: string | null;
  groundingLinks: string[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}