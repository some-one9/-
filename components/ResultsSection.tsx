import React from 'react';
import { SearchState } from '../types';
import ProductCard from './ProductCard';
import { AlertCircleIcon } from './Icons';

interface Props {
  state: SearchState;
}

const ResultsSection: React.FC<Props> = ({ state }) => {
  if (state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 animate-pulse">جاري البحث عن أفضل الأسعار...</p>
        <p className="text-xs text-gray-400 mt-2">يتم البحث عبر Google للعثور على أحدث العروض</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircleIcon className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-red-800">حدث خطأ</h3>
        <p className="text-red-600 mt-1">{state.error}</p>
      </div>
    );
  }

  if (state.results.length === 0 && !state.rawText) {
    return null; // Initial state
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">نتائج البحث</h2>
        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
          {state.results.length > 0 ? `${state.results.length} متاجر` : 'تقرير عام'}
        </span>
      </div>

      {state.results.length > 0 ? (
        <div className="space-y-4">
          {state.results.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="prose prose-sm max-w-none text-right rtl:text-right" dir="rtl">
            <h3 className="text-lg font-semibold mb-2">ملخص النتائج</h3>
             <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
              {state.rawText}
             </pre>
          </div>
        </div>
      )}

      {/* Grounding Sources */}
      {state.groundingLinks.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">المصادر</h4>
          <div className="flex flex-wrap gap-2">
            {state.groundingLinks.map((link, idx) => {
              try {
                const hostname = new URL(link).hostname.replace('www.', '');
                return (
                  <a 
                    key={idx} 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 bg-primary-50 px-3 py-1 rounded-full hover:bg-primary-100 transition-colors truncate max-w-[200px]"
                  >
                    {hostname}
                  </a>
                );
              } catch (e) {
                return null;
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsSection;