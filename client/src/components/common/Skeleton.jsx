import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200/80 rounded-xl ${className}`} />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-soft">
      <Skeleton className="w-full aspect-square rounded-xl mb-4" />
      <Skeleton className="w-1/3 h-3 mb-2" />
      <Skeleton className="w-3/4 h-5 mb-3" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="w-1/4 h-5" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  );
};
