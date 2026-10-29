import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Star,
  Sparkles,
  Share2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { RatingStars } from '../../components/common/RatingStars';
import { PricePulseChart } from '../../components/smart-features/PricePulseChart';
import { ProductPassportCard } from '../../components/smart-features/ProductPassportCard';
import { ProductCard } from '../../components/products/ProductCard';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('passport'); // 'passport', 'pricepulse', 'specs', 'reviews'

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slug}`);
        if (res.success && res.data?.product) {
          const prod = res.data.product;
          setProduct(prod);
          setSelectedImage(prod.images[0] || '');
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }

          // Fetch price history, reviews, and related products in parallel
          const [histRes, revRes, relRes] = await Promise.all([
            api.get(`/products/${prod._id}/price-history`),
            api.get(`/products/${prod._id}/reviews`),
            api.get(`/products/${prod._id}/related`)
          ]);

          if (histRes.success) setPriceHistory(histRes.data.history || []);
          if (revRes.success) setReviews(revRes.data.reviews || []);
          if (relRes.success) setRelated(relRes.data.related || []);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4 max-w-lg mx-auto">
          <div className="w-full aspect-square bg-gray-200 rounded-3xl" />
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Product not found</h2>
        <Link to="/shop" className="text-sphere-violet underline mt-2 inline-block">
          Return to catalogue
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const compareAtPrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const discountPercent =
    compareAtPrice && compareAtPrice > currentPrice
      ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
      : null;

  const handleAddToCart = async (openDrawer = true) => {
    const success = await addToCart(
      product._id,
      selectedVariant?._id || null,
      quantity,
      selectedVariant?.attributes || {}
    );
    if (success && openDrawer) {
      setIsCartOpen(true);
    }
    return success;
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart(false);
    if (success) {
      navigate('/checkout');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast('Please sign in to submit a review', { icon: '🔒' });
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post(`/products/${product._id}/reviews`, {
        rating: reviewRating,
        title: reviewTitle,
        body: reviewBody
      });
      if (res.success && res.data?.review) {
        setReviews([res.data.review, ...reviews]);
        setReviewTitle('');
        setReviewBody('');
        toast.success('Review submitted successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    if (!isAuthenticated) {
      toast('Please sign in to vote', { icon: '🔒' });
      return;
    }
    try {
      const res = await api.post(`/reviews/${reviewId}/helpful`);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId ? { ...r, helpfulCount: res.data.helpfulCount } : r
          )
        );
        toast.success('Helpful vote recorded');
      }
    } catch (err) {
      toast.error(err.message || 'Already voted');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14">
      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-sphere-charcoal">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-sphere-charcoal">Catalogue</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-sphere-charcoal">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-sphere-charcoal font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase: Left Gallery + Right Purchase Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-soft">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discountPercent && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-black bg-sphere-amber text-sphere-charcoal shadow-sm">
                SAVE {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnail Rail */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-sphere-violet ring-2 ring-sphere-violet/20'
                      : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Details & Buy Box */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="font-bold uppercase tracking-wider text-sphere-violet">
                {product.brand?.name || 'ShopSphere'}
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-gray-500 hover:text-sphere-charcoal transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-sphere-charcoal tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="mt-3 flex items-center gap-3">
              <RatingStars
                rating={product.ratingSummary?.average || 4.5}
                count={product.ratingSummary?.count || 12}
                size="md"
                showValue
              />
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified Feedback
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-sphere-cream border border-gray-200/80 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-sphere-charcoal">
                ₹{currentPrice.toLocaleString()}
              </span>
              {compareAtPrice && compareAtPrice > currentPrice && (
                <span className="text-base text-gray-400 line-through">
                  ₹{compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500">
              Inclusive of all taxes (18% GST). Standard carbon-neutral shipping calculated at checkout.
            </p>
          </div>

          {/* Description Snippet */}
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-sphere-charcoal block">
                Selected Edition: <strong className="text-sphere-violet">{selectedVariant?.name}</strong>
              </span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v._id}
                    onClick={() => {
                      setSelectedVariant(v);
                      if (v.image) setSelectedImage(v.image);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariant?._id === v._id
                        ? 'border-sphere-violet bg-sphere-violet-light text-sphere-violet ring-2 ring-sphere-violet/20'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Stock Status */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sphere-charcoal">Quantity:</span>
              <span className="font-semibold text-emerald-600">
                {currentStock > 5 ? 'In Stock — Ships Tomorrow' : currentStock > 0 ? `Only ${currentStock} units left` : 'Out of Stock'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-extrabold text-sphere-charcoal">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-bold disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-xl border transition-colors flex items-center justify-center ${
                  isInWishlist(product._id)
                    ? 'border-rose-200 bg-rose-50 text-rose-500'
                    : 'border-gray-200 hover:border-gray-300 text-gray-500 bg-white'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Purchase Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              icon={ShoppingBag}
              disabled={currentStock === 0}
              onClick={() => handleAddToCart(true)}
              className="w-full"
            >
              Add to Bag
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={Zap}
              disabled={currentStock === 0}
              onClick={handleBuyNow}
              className="w-full shadow-glow"
            >
              Buy Now
            </Button>
          </div>

          {/* Shipping & Trust Value Props */}
          <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Free delivery on orders over ₹2,000 (usually 2-3 business days)</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-sphere-violet" />
              <span>15-day verified return & replacement guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>{product.productPassport?.warranty || '1 Year Manufacturer Limited Warranty'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Product Passport, PricePulse, Specs, Reviews */}
      <div className="border-t border-gray-200 pt-10">
        <div className="flex gap-4 border-b border-gray-200 pb-2 overflow-x-auto text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('passport')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'passport'
                ? 'border-sphere-violet text-sphere-violet'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Product Passport</span>
          </button>

          <button
            onClick={() => setActiveTab('pricepulse')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'pricepulse'
                ? 'border-sphere-violet text-sphere-violet'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Sparkles className="w-4 h-4 text-sphere-amber" />
            <span>PricePulse™ History</span>
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'specs'
                ? 'border-sphere-violet text-sphere-violet'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>Technical Specifications</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'reviews'
                ? 'border-sphere-violet text-sphere-violet'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>Verified Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="pt-6">
          {/* Tab 1: Product Passport */}
          {activeTab === 'passport' && (
            <ProductPassportCard passport={product.productPassport} />
          )}

          {/* Tab 2: PricePulse */}
          {activeTab === 'pricepulse' && (
            <PricePulseChart
              history={priceHistory}
              currentPrice={currentPrice}
              compareAtPrice={compareAtPrice}
              productId={product._id}
              productName={product.name}
            />
          )}

          {/* Tab 3: Specifications */}
          {activeTab === 'specs' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft max-w-2xl">
              <h3 className="text-base font-bold text-sphere-charcoal mb-4">Detailed Specifications</h3>
              {product.specifications && product.specifications.length > 0 ? (
                <div className="divide-y divide-gray-100 text-xs">
                  {product.specifications.map((s, i) => (
                    <div key={i} className="py-2.5 flex justify-between">
                      <span className="font-semibold text-gray-500">{s.key}</span>
                      <span className="font-bold text-sphere-charcoal">{s.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">Standard manufacturer specifications apply.</p>
              )}
            </div>
          )}

          {/* Tab 4: Reviews & Rating Insights */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Rating Summary Header */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
                  <span className="text-4xl font-black text-sphere-charcoal">
                    {product.ratingSummary?.average || 4.5}
                  </span>
                  <div className="mt-1">
                    <RatingStars rating={product.ratingSummary?.average || 4.5} size="md" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Based on {product.ratingSummary?.count || reviews.length} customer evaluations
                  </p>
                </div>

                <div className="md:col-span-8 space-y-1.5 text-xs">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = product.ratingSummary?.distribution?.[star] || 0;
                    const total = product.ratingSummary?.count || 1;
                    const percent = Math.round((count / total) * 100);
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="w-12 text-gray-500 font-semibold">{star} Stars</span>
                        <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-8 text-right text-gray-400">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Submission Form */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
                <h4 className="text-sm font-bold text-sphere-charcoal mb-4">Write a Verified Review</h4>
                <form onSubmit={handleSubmitReview} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Your Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Review Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. Exceptional sound clarity and build"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sphere-violet"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Feedback</label>
                    <textarea
                      rows={3}
                      placeholder="Describe your acoustic, ergonomic, or material experience..."
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sphere-violet"
                      required
                    />
                  </div>

                  <Button type="submit" variant="primary" size="sm" loading={submittingReview}>
                    Submit Customer Review
                  </Button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-soft space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RatingStars rating={r.rating} size="sm" />
                        <span className="text-xs font-bold text-sphere-charcoal">{r.title}</span>
                      </div>
                      {r.isVerifiedPurchase && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Verified Purchase</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">{r.body}</p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100">
                      <span>By {r.user?.name || 'Customer'} on {new Date(r.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleHelpfulVote(r._id)}
                        className="hover:text-sphere-charcoal font-semibold flex items-center gap-1"
                      >
                        Helpful ({r.helpfulCount || 0})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Carousel */}
      {related.length > 0 && (
        <div className="border-t border-gray-200 pt-10">
          <h3 className="text-xl font-bold text-sphere-charcoal mb-6">Frequently Explored Together</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
