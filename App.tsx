import React, { useState, useRef } from 'react';
import { SearchIcon, CameraIcon, UploadIcon } from './components/Icons';
import ResultsSection from './components/ResultsSection';
import { findCheapestProduct } from './services/geminiService';
import { SearchState } from './types';

const App = () => {
  const [query, setQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>({
    isLoading: false,
    results: [],
    rawText: '',
    error: null,
    groundingLinks: []
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !selectedImage) return;

    setSearchState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let imageBase64: string | undefined = undefined;
      
      if (selectedImage && imagePreview) {
          // Remove Data URL prefix to get raw base64
          imageBase64 = imagePreview.split(',')[1];
      }

      const { results, rawText, links } = await findCheapestProduct(query, imageBase64);
      
      setSearchState({
        isLoading: false,
        results,
        rawText,
        error: null,
        groundingLinks: links
      });

    } catch (err) {
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: "حدث خطأ أثناء البحث. تأكد من اتصالك بالإنترنت أو حاول مرة أخرى لاحقاً."
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
              $
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">أرخص <span className="text-primary-600">Arkhos</span></h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 pt-8">
        
        {/* Hero Text */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">اعثر على أفضل صفقة</h2>
          <p className="text-gray-500">ابحث عن أي منتج وسنقوم بمقارنة الأسعار لك في ثوانٍ</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 mb-10 transition-shadow hover:shadow-xl">
          <form onSubmit={handleSearch} className="flex flex-col gap-2">
            
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="اسم المنتج... (مثلاً: ايفون 15 برو ماكس)"
                className="w-full px-4 py-4 pl-12 text-lg outline-none rounded-xl placeholder:text-gray-400 bg-transparent text-gray-900"
              />
              {/* Image Upload Button */}
              <div className="absolute left-2 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-full transition-colors ${imagePreview ? 'text-primary-600 bg-primary-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                    title="بحث بصورة"
                >
                    <CameraIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden"
                accept="image/*"
            />

            {/* Image Preview Area */}
            {imagePreview && (
                <div className="px-4 pb-2 flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                            type="button"
                            onClick={clearImage}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                        >
                            ×
                        </button>
                    </div>
                    <span className="text-sm text-gray-500">تم اختيار صورة للبحث</span>
                </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={searchState.isLoading || (!query && !selectedImage)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {searchState.isLoading ? 'جاري البحث...' : 'ابحث عن أرخص سعر'}
              {!searchState.isLoading && <SearchIcon className="w-5 h-5" />}
            </button>
          </form>
        </div>

        {/* Results */}
        <ResultsSection state={searchState} />

      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        <p>مدعوم بواسطة Gemini AI & Google Search</p>
      </footer>
    </div>
  );
};

export default App;