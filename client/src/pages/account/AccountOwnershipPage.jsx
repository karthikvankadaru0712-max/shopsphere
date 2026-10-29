import React, { useState, useEffect } from 'react';
import { Wrench, ShieldCheck, Clock, BookOpen, MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import api from '../../services/api';

export const AccountOwnershipPage = () => {
  const [ownedProducts, setOwnedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwned = async () => {
      try {
        setLoading(true);
        const res = await api.get('/smart/ownership-hub');
        if (res.success && res.data?.ownedProducts) {
          setOwnedProducts(res.data.ownedProducts);
        }
      } catch (err) {
        console.error('Failed to load owned products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOwned();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading your product library...</div>;
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-sphere-violet text-xs font-bold border border-purple-200 mb-2">
            <Wrench className="w-3.5 h-3.5" />
            <span>Distinctive Feature #9</span>
          </div>
          <h2 className="text-xl font-bold text-sphere-charcoal">Ownership Hub & Aftercare</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Post-purchase product library: live warranty countdowns, care tips, and user guides.
          </p>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 self-start sm:self-auto">
          {ownedProducts.length} Registered Model{ownedProducts.length === 1 ? '' : 's'}
        </span>
      </div>

      {ownedProducts.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-sphere-charcoal">No registered gear yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            When you complete an order, your products automatically register here with warranty tracking.
          </p>
          <Link to="/shop" className="inline-block pt-2">
            <Button variant="primary" size="md">
              Explore Catalogue
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {ownedProducts.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-gray-100 bg-sphere-cream/50 hover:bg-sphere-cream transition-all space-y-5"
            >
              {/* Product Info Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-white border border-gray-200 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      {item.product.brand}
                    </span>
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="text-sm font-bold text-sphere-charcoal hover:text-sphere-violet transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Order #{item.orderNumber} • Acquired {new Date(item.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Warranty Badge */}
                <div className="text-left sm:text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      item.warranty.isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{item.warranty.isActive ? 'Warranty Active' : 'Warranty Expired'}</span>
                  </span>
                  {item.warranty.isActive && (
                    <span className="block text-[11px] font-semibold text-emerald-700 mt-1">
                      {item.warranty.daysRemaining} days remaining
                    </span>
                  )}
                </div>
              </div>

              {/* Maintenance & Support Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-gray-200/60">
                <div className="p-3 bg-white rounded-xl border border-gray-100 space-y-1">
                  <span className="font-bold text-sphere-charcoal flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sphere-violet" />
                    <span>Care Instructions</span>
                  </span>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    {item.careInstructions}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-100 space-y-1">
                  <span className="font-bold text-sphere-charcoal flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Direct Certified Support</span>
                  </span>
                  <p className="text-gray-500 text-[11px]">
                    Need replacement pads or servicing? Contact{' '}
                    <strong className="text-sphere-charcoal">{item.supportContact}</strong>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
