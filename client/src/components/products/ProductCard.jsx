import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ImageOff } from 'lucide-react';
import { RatingStars } from '../common/RatingStars';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { motion } from 'motion/react';

export const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [imageFailed, setImageFailed] = React.useState(false);
  const inWishlist = isInWishlist(product._id);
  const productImage = Array.isArray(product.images) ? product.images[0] : product.images;

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-soft hover:shadow-card flex flex-col justify-between overflow-hidden"
    >
      <div>
        {/* Product Image Frame */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-3.5">
          <Link to={`/product/${product.slug}`} className="block w-full h-full">
            {productImage && !imageFailed ? (
              <img
                src={productImage}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[linear-gradient(145deg,#f4f2ed,#e8e6df)] text-gray-500">
                <ImageOff className="w-8 h-8" strokeWidth={1.5} />
                <span className="text-[11px] font-semibold">Image unavailable</span>
              </div>
            )}
          </Link>

          {/* Badges on Image */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
            {discountPercent && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-sphere-amber text-sphere-charcoal shadow-sm">
                SAVE {discountPercent}%
              </span>
            )}
            {product.isNewArrival && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-sphere-violet text-white shadow-sm">
                NEW
              </span>
            )}
            {product.productPassport?.repairability >= 8 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 backdrop-blur-sm text-emerald-800 shadow-sm border border-emerald-200">
                Eco {product.productPassport.repairability}/10
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={() => toggleWishlist(product)}
            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
              inWishlist
                ? 'bg-rose-50 text-rose-500 shadow-sm'
                : 'bg-white/80 text-gray-500 hover:text-rose-500 hover:bg-white'
            }`}
            title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Brand & Category */}
        <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
          <span className="uppercase font-semibold tracking-wider">
            {product.brand?.name || 'ShopSphere'}
          </span>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-amber-600 font-bold">Only {product.stock} left</span>
          )}
          {product.stock === 0 && (
            <span className="text-red-600 font-bold">Out of stock</span>
          )}
        </div>

        {/* Product Title */}
        <Link to={`/product/${product.slug}`} className="block group-hover:text-sphere-violet transition-colors">
          <h3 className="text-xs sm:text-sm font-bold text-sphere-charcoal line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="mt-2">
          <RatingStars
            rating={product.ratingSummary?.average || 4.5}
            count={product.ratingSummary?.count || 12}
            size="sm"
            showValue
          />
        </div>
      </div>

      {/* Price & Add to Cart */}
      <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-sphere-charcoal">
              ₹{product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-gray-600 line-through">
                ₹{product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => addToCart(product._id, null, 1)}
          disabled={product.stock === 0}
          className="p-1.5 sm:px-3 sm:py-2 rounded-xl bg-sphere-charcoal text-white hover:bg-sphere-violet hover:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="Add to bag"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>
    </motion.div>
  );
};
