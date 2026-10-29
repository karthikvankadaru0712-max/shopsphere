import React from 'react';
import { Filter, X, RotateCcw, Star, Check } from 'lucide-react';

export const ProductFilters = ({
  categories = [],
  brands = [],
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  minPrice,
  maxPrice,
  onPriceChange,
  rating,
  onRatingChange,
  inStock,
  onInStockToggle,
  onReset,
  className = ''
}) => {
  const priceBrackets = [
    { label: 'Under ₹3,000', min: 0, max: 3000 },
    { label: '₹3,000 - ₹8,000', min: 3000, max: 8000 },
    { label: '₹8,000 - ₹15,000', min: 8000, max: 15000 },
    { label: '₹15,000 & Above', min: 15000, max: 100000 },
  ];

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    Boolean(selectedBrand) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(rating) ||
    Boolean(inStock);

  return (
    <aside className={`space-y-6 ${className}`}>
      {/* Header & Reset Button */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2 font-bold text-sm text-sphere-charcoal">
          <Filter className="w-4 h-4 text-sphere-violet" />
          <span>Filter Products</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-sphere-violet hover:underline font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* In-Stock Only Toggle */}
      <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-sphere-charcoal">In Stock Only</span>
        <button
          type="button"
          onClick={() => onInStockToggle(!inStock)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            inStock ? 'bg-sphere-violet' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              inStock ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Categories Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Categories
        </h4>
        <div className="space-y-1.5">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
              !selectedCategory
                ? 'bg-sphere-violet-light text-sphere-violet font-bold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>All Categories</span>
            {!selectedCategory && <Check className="w-3.5 h-3.5" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                selectedCategory === cat.slug
                  ? 'bg-sphere-violet-light text-sphere-violet font-bold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{cat.name}</span>
              {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Price Range (₹)
        </h4>
        <div className="space-y-2 mb-3">
          {priceBrackets.map((b, idx) => {
            const isSelected = minPrice === b.min && maxPrice === b.max;
            return (
              <button
                key={idx}
                onClick={() => onPriceChange(isSelected ? '' : b.min, isSelected ? '' : b.max)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-sphere-violet text-white font-bold'
                    : 'bg-white border border-gray-100 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{b.label}</span>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Custom Price Inputs */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice || ''}
            onChange={(e) => onPriceChange(e.target.value ? Number(e.target.value) : '', maxPrice)}
            className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-sphere-violet"
          />
          <span className="text-gray-400 text-xs">-</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice || ''}
            onChange={(e) => onPriceChange(minPrice, e.target.value ? Number(e.target.value) : '')}
            className="w-1/2 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-sphere-violet"
          />
        </div>
      </div>

      {/* Brands Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Featured Brands
        </h4>
        <div className="space-y-1.5">
          <button
            onClick={() => onSelectBrand('')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
              !selectedBrand
                ? 'bg-sphere-violet-light text-sphere-violet font-bold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>All Brands</span>
            {!selectedBrand && <Check className="w-3.5 h-3.5" />}
          </button>
          {brands.map((b) => (
            <button
              key={b._id}
              onClick={() => onSelectBrand(b.slug)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                selectedBrand === b.slug
                  ? 'bg-sphere-violet-light text-sphere-violet font-bold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{b.name}</span>
              {selectedBrand === b.slug && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Customer Rating
        </h4>
        <div className="space-y-1.5">
          {[4, 3].map((r) => (
            <button
              key={r}
              onClick={() => onRatingChange(rating === r ? '' : r)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                rating === r
                  ? 'bg-amber-50 text-amber-900 border border-amber-300 font-bold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{r} Stars & Above</span>
              </div>
              {rating === r && <Check className="w-3.5 h-3.5 text-amber-700" />}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
