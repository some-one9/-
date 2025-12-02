import React from 'react';
import { ProductResult } from '../types';
import { ExternalLinkIcon, TagIcon } from './Icons';

interface Props {
  product: ProductResult;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  return (
    <div className={`relative bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${product.isCheapest ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200'}`}>
      
      {product.isCheapest && (
        <div className="absolute -top-3 left-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
           <TagIcon className="w-3 h-3" />
           أفضل سعر
        </div>
      )}

      <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Store Info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{product.storeName}</h3>
          <p className="text-sm text-gray-500 mt-1">{product.notes}</p>
        </div>

        {/* Price & Action */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
          <div className="text-left md:text-right">
            <span className={`block text-xl font-bold ${product.isCheapest ? 'text-primary-600' : 'text-gray-800'}`}>
              {product.price} <span className="text-sm font-normal text-gray-500">{product.currency}</span>
            </span>
          </div>
          
          <a 
            href={product.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              product.isCheapest 
              ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            شراء الآن
            <ExternalLinkIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;