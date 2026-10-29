import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('alex@example.com'); // Pre-filled for effortless evaluation demo
  const [password, setPassword] = useState('Customer@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleQuickAdmin = () => {
    setEmail('admin@shopsphere.com');
    setPassword('Admin@123456');
  };

  const handleQuickCustomer = () => {
    setEmail('alex@example.com');
    setPassword('Customer@123456');
  };

  return (
    <div className="min-h-screen bg-sphere-cream flex items-stretch">
      {/* Left Editorial Brand Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-sphere-charcoal text-white overflow-hidden flex-col justify-between p-12">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80"
            alt="High-end acoustic design"
            className="w-full h-full object-cover opacity-35 filter scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sphere-charcoal via-sphere-charcoal/70 to-transparent" />
        </div>

        {/* Top Branding */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-sphere-violet flex items-center justify-center text-white font-black text-xl shadow-lg shadow-sphere-violet/40">
              S
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">ShopSphere</span>
          </Link>
        </div>

        {/* Center Editorial Manifesto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 max-w-lg space-y-4 my-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-sphere-violet-light">
            <Sparkles className="w-3.5 h-3.5 text-sphere-amber" />
            <span>Discover Better. Shop Smarter.</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Shopping, reimagined for the conscious creator.
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            Real price history transparency. Live budget-aware SmartCart calculations. Complete digital product passports for verified longevity.
          </p>
        </motion.div>

        {/* Bottom Callout */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Session & Cookie Authentication</span>
          </div>
          <span>BTech FSD Capstone Edition</span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-gray-100"
        >
          {/* Mobile Brand Link */}
          <div className="lg:hidden mb-6 flex justify-between items-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sphere-violet flex items-center justify-center text-white font-bold text-sm">
                S
              </div>
              <span className="text-lg font-bold text-sphere-charcoal">ShopSphere</span>
            </Link>
            <Link to="/" className="text-xs text-gray-500 hover:text-sphere-charcoal">
              Home &rarr;
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-sphere-charcoal tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Enter your credentials to manage your orders, wishlist, and alerts.
            </p>
          </div>

          {/* Quick Demo Account Selector (Helpful for Faculty/Evaluator Review) */}
          <div className="mb-6 p-3 bg-sphere-cream rounded-2xl border border-gray-200/80 text-xs">
            <span className="font-bold text-gray-600 block mb-1.5 uppercase text-[10px] tracking-wider">
              Quick Evaluator Credentials:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleQuickCustomer}
                className="flex-1 py-1.5 px-2 bg-white rounded-xl border border-gray-200 text-sphere-charcoal font-semibold hover:border-sphere-violet transition-colors text-center text-[11px]"
              >
                Customer Demo
              </button>
              <button
                type="button"
                onClick={handleQuickAdmin}
                className="flex-1 py-1.5 px-2 bg-white rounded-xl border border-gray-200 text-sphere-charcoal font-semibold hover:border-sphere-violet transition-colors text-center text-[11px]"
              >
                Admin Demo
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                endIcon={showPassword ? EyeOff : Eye}
                onEndIconClick={() => setShowPassword(!showPassword)}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs text-sphere-violet hover:underline font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              icon={ArrowRight}
            >
              Sign In to Account
            </Button>
          </form>

          {/* Guest Shopping Option */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-3">
            <p className="text-xs text-gray-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-sphere-violet hover:underline">
                Create one now
              </Link>
            </p>
            <Link
              to="/shop"
              className="inline-block text-xs text-gray-400 hover:text-sphere-charcoal underline"
            >
              Continue shopping as guest &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
