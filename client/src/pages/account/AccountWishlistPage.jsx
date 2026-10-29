import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { ProductCard } from '../../components/products/ProductCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';

export const AccountWishlistPage = () => {
  const { wishlist, loading } = useWishlist();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-sphere-charcoal">My Saved Wishlist</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Keep track of items you plan to purchase or compare later.
          </p>
        </div>
        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
          {wishlist.length} item{wishlist.length === 1 ? '' : 's'}
        </span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400">Loading wishlist...</div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Heart className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-sphere-charcoal">Your wishlist is empty</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Click the heart icon on any product to save it here for later consideration.
          </p>
          <Link to="/shop" className="inline-block pt-2">
            <Button variant="primary" size="md">
              Browse Catalogue
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
