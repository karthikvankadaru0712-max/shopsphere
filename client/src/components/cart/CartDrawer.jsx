import React, { useState } from 'react';
import { Drawer } from '../common/Drawer';
import { useCart } from '../../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';

export const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    budget,
    updateBudget
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudgetInput, setNewBudgetInput] = useState(budget.toString());
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponCode.trim());
    setIsApplyingCoupon(false);
    setCouponCode('');
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const val = Number(newBudgetInput);
    if (val && val > 0) {
      updateBudget(val);
      setEditingBudget(false);
    }
  };

  const remainingBudget = budget - cart.total;
  const isOverBudget = remainingBudget < 0;
  const budgetUsagePercent = Math.min(100, Math.round((cart.total / budget) * 100));

  return (
    <Drawer
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      title="Shopping Bag"
      subtitle={`${cart.itemCount} item${cart.itemCount === 1 ? '' : 's'} in your order`}
      width="max-w-lg"
    >
      {cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-sphere-charcoal">Your bag is empty</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">
            Discover curated acoustic tech, ergonomic desk setups, and premium lifestyle essentials.
          </p>
          <Button
            variant="primary"
            size="md"
            className="mt-6"
            onClick={() => {
              setIsCartOpen(false);
              navigate('/shop');
            }}
          >
            Explore Catalogue
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full space-y-6">
          {/* SmartCart Budget Health Meter */}
          <div className="p-4 rounded-2xl bg-sphere-cream border border-gray-200/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-sphere-charcoal">
                <Sparkles className="w-4 h-4 text-sphere-violet" />
                <span>SmartCart Budget Meter</span>
              </div>
              {editingBudget ? (
                <form onSubmit={handleSaveBudget} className="flex items-center gap-1">
                  <input
                    type="number"
                    value={newBudgetInput}
                    onChange={(e) => setNewBudgetInput(e.target.value)}
                    className="w-20 px-2 py-0.5 text-xs border rounded bg-white"
                  />
                  <button type="submit" className="text-xs font-bold text-sphere-violet">
                    Save
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setEditingBudget(true)}
                  className="text-xs text-sphere-violet hover:underline font-semibold"
                >
                  Target: ₹{budget.toLocaleString()}
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isOverBudget
                    ? 'bg-red-500'
                    : budgetUsagePercent > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${budgetUsagePercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-600">
              <span>{budgetUsagePercent}% of budget used</span>
              <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-emerald-700'}`}>
                {isOverBudget
                  ? `Over by ₹${Math.abs(remainingBudget).toLocaleString()}`
                  : `₹${remainingBudget.toLocaleString()} remaining`}
              </span>
            </div>

            {isOverBudget && (
              <div className="mt-2.5 flex items-center justify-between text-[11px] bg-red-50 border border-red-200 p-2 rounded-xl text-red-700">
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Budget exceeded</span>
                </div>
                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="font-bold underline text-red-800"
                >
                  View Cheaper Alternatives &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Free Shipping Alert Banner */}
          {cart.amountForFreeShipping > 0 ? (
            <div className="text-xs bg-purple-50 text-purple-900 border border-purple-200/60 p-2.5 rounded-xl flex items-center justify-between">
              <span>Add <strong>₹{cart.amountForFreeShipping.toLocaleString()}</strong> more for FREE shipping</span>
              <span className="text-[10px] uppercase font-bold text-sphere-violet bg-white px-2 py-0.5 rounded-md">
                Threshold ₹2,000
              </span>
            </div>
          ) : (
            <div className="text-xs bg-emerald-50 text-emerald-900 border border-emerald-200/60 p-2.5 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>You unlocked <strong>FREE Carbon-Neutral Delivery</strong>!</span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
            {cart.items.map((item) => (
              <div key={item._id} className="py-4 flex gap-4">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-sphere-charcoal truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 uppercase">{item.product.brand}</p>
                  {item.variantDetails && (
                    <span className="inline-block text-[10px] bg-gray-100 px-1.5 py-0.5 rounded mt-0.5 text-gray-600">
                      {item.variantDetails.name}
                    </span>
                  )}

                  <div className="flex items-center justify-between mt-2.5">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-sphere-charcoal hover:bg-gray-100 rounded-l-lg"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-semibold text-sphere-charcoal">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-sphere-charcoal hover:bg-gray-100 rounded-r-lg"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-sphere-charcoal">
                        ₹{item.itemTotal.toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Code Input */}
          <div className="pt-2">
            {cart.appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
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
                  placeholder="Coupon code (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sphere-violet"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  loading={isApplyingCoupon}
                  disabled={!couponCode.trim()}
                >
                  Apply
                </Button>
              </form>
            )}
          </div>

          {/* Order Summary Breakdown */}
          <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-sphere-charcoal">
                ₹{cart.subtotal.toLocaleString()}
              </span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon Discount</span>
                <span>-₹{cart.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{cart.shipping === 0 ? 'FREE' : `₹${cart.shipping}`}</span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-600">
              <span>Estimated 18% GST (Included)</span>
              <span>₹{cart.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-sphere-charcoal pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-sphere-violet">₹{cart.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <div className="pt-2 space-y-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2 py-3.5"
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="md"
              className="w-full text-xs text-gray-600"
              onClick={() => {
                setIsCartOpen(false);
                navigate('/cart');
              }}
            >
              View Full Cart & Budget Assistant
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};
