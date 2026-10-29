import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../common/Button';
import api, { getGuestId } from '../../services/api';
import toast from 'react-hot-toast';

export const SmartCartAssistant = () => {
  const { cart, budget, updateBudget, addToCart, removeFromCart, refreshCart } = useCart();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);

  const fetchAnalysis = async () => {
    if (cart.items.length === 0) return;
    try {
      setLoading(true);
      const guestId = getGuestId();
      const res = await api.post('/smart/smart-cart', {
        guestId,
        budget
      });
      if (res.success && res.data) {
        setAnalysis(res.data);
      }
    } catch (err) {
      console.error('SmartCart analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [cart.items, budget]);

  const handleSwapAlternative = async (alt) => {
    try {
      setSwapping(true);
      // Remove target item from cart
      await removeFromCart(alt.targetCartItem.id);
      // Add alternative product
      await addToCart(alt.alternativeProduct._id, null, alt.targetCartItem.quantity);
      toast.success(`Swapped for ${alt.alternativeProduct.name}! Saved ₹${alt.totalSavings.toLocaleString()}`, {
        icon: '🎉'
      });
      await refreshCart();
    } catch (err) {
      toast.error('Failed to swap alternative');
    } finally {
      setSwapping(false);
    }
  };

  if (!analysis || cart.items.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sphere-violet-light text-sphere-violet flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-sphere-charcoal">SmartCart Budget Assistant</h3>
            <p className="text-xs text-gray-500">Autonomous budget analysis & verified alternative recommendations</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Target Budget:</span>
          <span className="font-extrabold text-sphere-charcoal">₹{budget.toLocaleString()}</span>
        </div>
      </div>

      {/* Dynamic Health Bar */}
      <div className="p-4 bg-sphere-cream rounded-2xl border border-gray-200/80">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="font-semibold text-sphere-charcoal">Cart Expenditure Progress</span>
          <span className={`font-bold ${analysis.isOverBudget ? 'text-red-600' : 'text-emerald-700'}`}>
            {analysis.isOverBudget
              ? `Exceeded budget by ₹${analysis.overBudgetAmount.toLocaleString()}`
              : `₹${analysis.remainingBudget.toLocaleString()} headroom remaining`}
          </span>
        </div>

        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              analysis.isOverBudget
                ? 'bg-red-500'
                : analysis.budgetUsagePercent > 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, analysis.budgetUsagePercent)}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-gray-500 mt-2">
          <span>₹0</span>
          <span>50%</span>
          <span>Target ₹{budget.toLocaleString()}</span>
        </div>
      </div>

      {/* Cheaper Alternatives Recommendations */}
      {analysis.alternatives.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Smart Savings Opportunities ({analysis.alternatives.length})
            </h4>
            {analysis.potentialTotalSavings > 0 && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Potential Savings: ₹{analysis.potentialTotalSavings.toLocaleString()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-emerald-200/60 bg-emerald-50/20 hover:bg-emerald-50/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
                    <span>Replace higher-priced item:</span>
                    <span className="line-through text-gray-400">
                      ₹{alt.targetCartItem.currentPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-700 truncate mb-3">
                    {alt.targetCartItem.name}
                  </p>

                  {/* Alternative Card */}
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <img
                      src={alt.alternativeProduct.image}
                      alt={alt.alternativeProduct.name}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-50"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-sphere-charcoal truncate">
                        {alt.alternativeProduct.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-extrabold text-emerald-600">
                          ₹{alt.alternativeProduct.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          ★ {alt.alternativeProduct.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200/40 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">
                    Save ₹{alt.totalSavings.toLocaleString()}
                  </span>
                  <Button
                    variant="mint"
                    size="sm"
                    loading={swapping}
                    onClick={() => handleSwapAlternative(alt)}
                    className="text-xs py-1.5"
                  >
                    Accept Recommendation
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
