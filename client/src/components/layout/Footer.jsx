import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, RefreshCw, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    try {
      setLoading(true);
      await api.post('/users/newsletter', { email });
      setSubscribed(true);
      setEmail('');
      toast.success('Welcome to the ShopSphere community!');
    } catch (err) {
      toast.error(err.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-sphere-charcoal text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-14 border-b border-white/10">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sphere-violet shrink-0 border border-white/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Product Passport</h4>
              <p className="text-xs text-gray-400 mt-0.5">Verified materials, origin, and certified warranties.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 shrink-0 border border-white/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">SmartCart Budgeting</h4>
              <p className="text-xs text-gray-400 mt-0.5">Automated savings & cheaper verified alternatives.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 shrink-0 border border-white/10">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">PricePulse Alerts</h4>
              <p className="text-xs text-gray-400 mt-0.5">Transparent historical price tracking and target drops.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-rose-400 shrink-0 border border-white/10">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Carbon-Neutral Freight</h4>
              <p className="text-xs text-gray-400 mt-0.5">Zero net carbon footprint on all deliveries.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-14 border-b border-white/10">
          {/* Brand & Editorial Column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sphere-violet flex items-center justify-center text-white font-extrabold text-lg">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ShopSphere</span>
            </Link>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Discover Better. Shop Smarter. A thoughtful e-commerce platform blending high-fidelity audio, architectural desk accessories, and intelligent discovery tools.
            </p>

            {/* Newsletter Form */}
            <div className="pt-2">
              <p className="text-xs font-bold text-white mb-2">Join the Collective</p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You are subscribed to exclusive product releases.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sphere-violet"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl bg-sphere-violet text-white text-xs font-bold hover:bg-sphere-violet-dark transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Links Column 1: Explore */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Explore</h5>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=audio" className="hover:text-white transition-colors">Audio & Acoustics</Link></li>
              <li><Link to="/shop?category=home-office" className="hover:text-white transition-colors">Home Office</Link></li>
              <li><Link to="/shop?category=wearables" className="hover:text-white transition-colors">Wearables</Link></li>
              <li><Link to="/shop?category=lifestyle" className="hover:text-white transition-colors">Everyday Carry</Link></li>
              <li><Link to="/compare" className="hover:text-white transition-colors">Product Comparison</Link></li>
            </ul>
          </div>

          {/* Links Column 2: Distinctive Features */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Smart Features</h5>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><Link to="/matchscore" className="hover:text-white transition-colors">MatchScore Finder</Link></li>
              <li><Link to="/vibefind" className="hover:text-white transition-colors">VibeFind Curations</Link></li>
              <li><Link to="/gift-finder" className="hover:text-white transition-colors">Gift Finder Quiz</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">SmartCart Assistant</Link></li>
              <li><Link to="/collections" className="hover:text-white transition-colors">Smart Collections</Link></li>
              <li><Link to="/account/product-library" className="hover:text-white transition-colors">Ownership Hub & Care</Link></li>
            </ul>
          </div>

          {/* Links Column 3: Support & Legal */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Support & Trust</h5>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About ShopSphere</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center & FAQ</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping & Freight</Link></li>
              <li><Link to="/return-policy" className="hover:text-white transition-colors">Return Policy</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>&copy; {new Date().getFullYear()} ShopSphere Inc. Crafted with precision for BTech Full Stack Development.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Secure 256-bit SSL Checkout
            </span>
            <span>Local Currency: INR (₹)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
