import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { SmartCartAssistant } from '../../components/smart-features/SmartCartAssistant';

export const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setLoadingCoupon(true);
    await applyCoupon(couponCode.trim());
    setLoadingCoupon(false);
    setCouponCode('');
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-sphere-charcoal">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
          Explore curated studio monitors, custom mechanical keyboards, and sustainable everyday carry packs.
        </p>
        <Link to="/shop" className="mt-8 inline-block">
          <Button variant="primary" size="lg">
            Explore Catalogue &rarr;
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-sphere-charcoal tracking-tight">
            Shopping Bag ({cart.itemCount})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Authoritative server-side pricing & real-time inventory validation
          </p>
        </div>
        <Link to="/shop" className="text-xs font-bold text-sphere-violet hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* DISTINCTIVE FEATURE 1: SMARTCART BUDGET ASSISTANT */}
      <SmartCartAssistant />

      {/* Main Cart Grid: Left Items + Right Totals Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Items Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft divide-y divide-gray-100">
          {cart.items.map((item) => (
            <div key={item._id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
              <div className="flex gap-4 items-center">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-2xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                    {item.product.brand}
                  </span>
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="text-sm font-bold text-sphere-charcoal hover:text-sphere-violet line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  {item.variantDetails && (
                    <span className="inline-block text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 mt-1">
                      {item.variantDetails.name}
                    </span>
                  )}
                  <p className="text-xs font-bold text-sphere-charcoal mt-1">
                    ₹{item.price.toLocaleString()} each
                  </p>
                </div>
              </div>

              {/* Quantity Stepper & Item Total */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                <div className="flex items-center border border-gray-200 rounded-xl bg-white p-1">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-sphere-charcoal">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-sphere-charcoal block">
                    ₹{item.itemTotal.toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-[11px] text-red-500 hover:underline flex items-center gap-1 mt-0.5 ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Checkout Summary Box */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-5">
            <h3 className="text-base font-bold text-sphere-charcoal pb-3 border-b border-gray-100">
              Order Summary
            </h3>

            {/* Coupon Application */}
            <div>
              {cart.appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-800">{cart.appliedCoupon.code}</span>
                    <span className="text-emerald-700">(-₹{cart.appliedCoupon.discountAmount.toLocaleString()})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-600 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sphere-violet"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    loading={loadingCoupon}
                    disabled={!couponCode.trim()}
                  >
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-sphere-charcoal">₹{cart.subtotal.toLocaleString()}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{cart.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Standard Delivery</span>
                <span>{cart.shipping === 0 ? 'FREE' : `₹${cart.shipping}`}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>Estimated 18% GST (Included)</span>
                <span>₹{cart.tax.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-lg font-black text-sphere-charcoal pt-3 border-t border-gray-200">
                <span>Grand Total</span>
                <span className="text-sphere-violet">₹{cart.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <Button
              variant="primary"
              size="lg"
              className="w-full py-3.5 shadow-glow"
              icon={ArrowRight}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>

            <div className="pt-2 text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SSL Encrypted Checkout with Inventory Reservation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
