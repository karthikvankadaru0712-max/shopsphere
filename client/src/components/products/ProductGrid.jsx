import React from 'react';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import { SearchX } from 'lucide-react';
import { Button } from '../common/Button';

export const ProductGrid = ({ products = [], loading = false, onResetFilters }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-5 xl:gap-6">
        {[...Array(8)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-soft max-w-lg mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mx-auto mb-4">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-sphere-charcoal">No products match your criteria</h3>
        <p className="text-xs text-gray-500 mt-1 mb-6">
          Try expanding your price range, clearing filters, or exploring a different category.
        </p>
        {onResetFilters && (
          <Button variant="secondary" size="md" onClick={onResetFilters}>
            Clear All Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-5 xl:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};
