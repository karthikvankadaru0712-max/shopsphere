import React, { useState, useEffect } from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import api from '../../services/api';

export const VibeFindPage = () => {
  const [activeVibe, setActiveVibe] = useState('work-setup');
  const [vibeData, setVibeData] = useState(null);
  const [loading, setLoading] = useState(true);

  const vibes = [
    { key: 'work-setup', title: 'Dream Desk & Work Setup' },
    { key: 'college-essentials', title: 'College Essentials' },
    { key: 'travel-kit', title: 'Travel & Mobility Kit' },
    { key: 'minimal-lifestyle', title: 'Minimal Lifestyle' },
    { key: 'fitness-active', title: 'Fitness & Active Living' },
  ];

  useEffect(() => {
    const fetchVibeData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/smart/vibefind', {
          params: { vibe: activeVibe }
        });
        if (res.success && res.data) {
          setVibeData(res.data);
        }
      } catch (err) {
        console.error('Failed to load vibe curation:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVibeData();
  }, [activeVibe]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>Distinctive Feature #5</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-sphere-charcoal tracking-tight">
          VibeFind™ Aesthetic Curation
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Discover products categorized by real-world aesthetic and lifestyle vibes rather than rigid technological taxonomy.
        </p>
      </div>

      {/* Vibe Selection Tabs */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 justify-start sm:justify-center">
        {vibes.map((v) => (
          <button
            key={v.key}
            onClick={() => setActiveVibe(v.key)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeVibe === v.key
                ? 'bg-sphere-charcoal text-white shadow-md scale-105'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {v.title}
          </button>
        ))}
      </div>

      {/* Vibe Banner */}
      {vibeData?.vibeInfo && (
        <div className="bg-sphere-cream rounded-3xl p-6 sm:p-8 border border-gray-200/80 text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-sphere-charcoal">
            {vibeData.vibeInfo.title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            {vibeData.vibeInfo.subtitle}
          </p>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : vibeData?.products && vibeData.products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {vibeData.products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">No products found for this vibe.</div>
      )}
    </div>
  );
};
