import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Gift,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  Headphones,
  Monitor,
  Watch,
  Briefcase
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { ProductCard } from '../../components/products/ProductCard';
import { RatingStars } from '../../components/common/RatingStars';
import api from '../../services/api';

export const HomePage = () => {
  const [homeData, setHomeData] = useState({
    featured: [],
    trending: [],
    newArrivals: [],
    bestSellers: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/products/home-sections');
        if (res.success && res.data) {
          setHomeData(res.data);
        }
      } catch (err) {
        console.error('Failed to load home sections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-16 pb-12 bg-gradient-to-b from-white via-sphere-cream to-sphere-cream border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sphere-violet-light border border-sphere-violet/20 text-xs font-bold text-sphere-violet">
                <Sparkles className="w-3.5 h-3.5 text-sphere-amber" />
                <span>Next-Gen Conscious Shopping Platform</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-sphere-charcoal tracking-tight leading-[1.1]">
                Discover Better.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sphere-violet to-purple-800">
                  Shop Smarter.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Experience an intelligent shopping ecosystem powered by budget-aware SmartCart calculations, genuine PricePulse historical tracking, and certified Digital Product Passports.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link to="/shop">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto shadow-md">
                    <span>Explore Catalogue</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/matchscore">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-glow">
                    <Sparkles className="w-4 h-4 mr-1" />
                    <span>Launch MatchScore™</span>
                  </Button>
                </Link>
              </div>

              {/* Hero Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200/80 max-w-md mx-auto lg:mx-0 text-left">
                <div>
                  <span className="text-xl sm:text-2xl font-black text-sphere-charcoal block">40+</span>
                  <span className="text-xs text-gray-500 font-medium">Verified Products</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black text-sphere-charcoal block">100%</span>
                  <span className="text-xs text-gray-500 font-medium">Price Transparency</span>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-black text-sphere-charcoal block">15 Days</span>
                  <span className="text-xs text-gray-500 font-medium">Zero-Risk Returns</span>
                </div>
              </div>
            </motion.div>

            {/* Right Hero Visual Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl bg-sphere-charcoal border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
                  alt="Aura Studio Wireless Headphones"
                  className="w-full h-full object-cover"
                />

                {/* Floating Smart Badge 1 */}
                <div className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-sphere-charcoal">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Product Passport 9/10</span>
                  </div>
                  <span className="text-[10px] text-gray-500">Recycled Beryllium Aluminum</span>
                </div>

                {/* Floating Smart Badge 2 */}
                <div className="absolute bottom-4 right-4 p-3.5 bg-sphere-charcoal/90 backdrop-blur-md text-white rounded-2xl shadow-xl border border-white/10 text-xs">
                  <span className="text-[10px] uppercase font-bold text-sphere-amber block">
                    PricePulse Status
                  </span>
                  <span className="text-sm font-extrabold text-white">Lowest Historic: ₹18,999</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-sphere-violet uppercase tracking-wider">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-sphere-charcoal tracking-tight mt-1">
              Shop by Domain
            </h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-sphere-violet hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {homeData.categories.slice(0, 4).map((category) => (
            <Link
              key={category._id}
              to={`/shop?category=${category.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-gray-100 border border-gray-100 shadow-soft hover:shadow-card transition-all"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sphere-charcoal/90 via-sphere-charcoal/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-sm sm:text-base font-bold group-hover:text-sphere-violet-light transition-colors">
                  {category.name}
                </h3>
                <p className="text-[11px] text-gray-300 line-clamp-1 mt-0.5">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Trending Now
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-sphere-charcoal tracking-tight mt-1">
              Popular Creator Gear
            </h2>
          </div>
          <Link to="/shop?sort=bestseller" className="text-xs font-bold text-sphere-violet hover:underline">
            Explore All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {homeData.trending.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. SMARTCART BUDGET FEATURE SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-sphere-charcoal via-sphere-charcoal to-gray-900 rounded-3xl p-8 sm:p-14 text-white overflow-hidden relative shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-sphere-violet-light border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-sphere-amber" />
                <span>Distinctive Feature #1</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                SmartCart: Autonomous Budget Awareness
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
                Set your spending limit and watch your cart dynamically track remaining headroom. If you exceed your target, SmartCart automatically computes verified cheaper alternatives without forcing any compromises.
              </p>

              <div className="pt-2 flex gap-4">
                <Link to="/cart">
                  <Button variant="mint" size="md">
                    Try SmartCart Now
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button variant="outline" size="md" className="text-white border-white/30 hover:bg-white/10">
                    Browse Gear
                  </Button>
                </Link>
              </div>
            </div>

            {/* Simulated Live Budget Meter Mockup */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Target Budget</span>
                <span className="font-bold text-white">₹15,000</span>
              </div>
              <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[68%] rounded-full" />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400 font-bold">68% Budget Consumed</span>
                <span className="text-gray-300">₹4,800 Headroom</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-gray-300 flex items-center justify-between">
                <span>1 verified cheaper alternative found</span>
                <span className="font-bold text-emerald-400">Save ₹2,500 &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-sphere-violet uppercase tracking-wider">
              Latest Additions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-sphere-charcoal tracking-tight mt-1">
              New Arrivals
            </h2>
          </div>
          <Link to="/shop?sort=newest" className="text-xs font-bold text-sphere-violet hover:underline">
            View Newest &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {homeData.newArrivals.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. VIBEFIND & GIFT FINDER DUAL TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* VibeFind Box */}
          <div className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3 relative z-10">
              <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">
                Lifestyle Discovery
              </span>
              <h3 className="text-2xl font-black">VibeFind™ Showcases</h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed max-w-sm">
                Explore setups crafted for College Essentials, Dream Desk Workspaces, Travel Kits, and Minimal Living.
              </p>
            </div>
            <div className="pt-6 relative z-10">
              <Link to="/vibefind">
                <Button variant="mint" size="md">
                  Explore Vibes &rarr;
                </Button>
              </Link>
            </div>
          </div>

          {/* Gift Finder Box */}
          <div className="bg-purple-950 text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3 relative z-10">
              <span className="text-xs uppercase font-extrabold text-rose-400 tracking-wider">
                Gifting Assistant
              </span>
              <h3 className="text-2xl font-black">Interactive Gift Finder</h3>
              <p className="text-xs text-purple-200/80 leading-relaxed max-w-sm">
                Answer 3 quick questions about the occasion, recipient, and budget to unlock tailored recommendations.
              </p>
            </div>
            <div className="pt-6 relative z-10">
              <Link to="/gift-finder">
                <Button variant="primary" size="md">
                  Take Gift Quiz &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Verified Best Sellers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-sphere-charcoal tracking-tight mt-1">
              Customer Favorites
            </h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-sphere-violet hover:underline">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {homeData.bestSellers.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};
