import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic Password Strength
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let label = 'Weak';
    let color = 'bg-red-500 text-red-700';
    if (score === 2) {
      label = 'Fair';
      color = 'bg-amber-500 text-amber-700';
    } else if (score === 3) {
      label = 'Good';
      color = 'bg-emerald-500 text-emerald-700';
    } else if (score === 4) {
      label = 'Strong';
      color = 'bg-sphere-violet text-sphere-violet';
    }

    return { score, label, color };
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!password) {
      toast.error('Please enter a password');
      return;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error('Password must be at least 8 characters and include an uppercase letter and a number');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      toast.error('Please accept the Terms of Service to continue');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      navigate('/shop');
    }
  };

  return (
    <div className="min-h-screen bg-sphere-cream flex items-stretch">
      {/* Left Editorial Brand Campaign */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-sphere-charcoal text-white overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1400&q=80"
            alt="Minimal workspace aesthetics"
            className="w-full h-full object-cover opacity-35 filter scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sphere-charcoal via-sphere-charcoal/70 to-transparent" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sphere-violet flex items-center justify-center text-white font-black text-xl shadow-lg">
              S
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">ShopSphere</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 max-w-lg space-y-4 my-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-sphere-violet-light">
            <Sparkles className="w-3.5 h-3.5 text-sphere-amber" />
            <span>Join 10,000+ Conscious Creators</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Own less. Own better.
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            Create an account to track lifetime warranty claims in the Ownership Hub, receive instant PricePulse notifications, and save custom hardware collections.
          </p>
        </motion.div>

        <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-gray-400">
          <span>&copy; {new Date().getFullYear()} ShopSphere. Verified Architecture.</span>
        </div>
      </div>

      {/* Right Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-gray-100"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-black text-sphere-charcoal tracking-tight">
              Create an account
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Start shopping with automated budget awareness and price drop alerts.
            </p>
          </div>

          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              icon={User}
              placeholder="Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Use at least 8 characters, including one uppercase letter and one number."
                required
              />

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400">Security strength:</span>
                    <span className={`font-bold ${strength.color.split(' ')[1]}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          s <= strength.score ? strength.color.split(' ')[0] : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {/* Terms checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-sphere-violet focus:ring-sphere-violet"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-tight">
                I agree to the{' '}
                <Link to="/terms" className="text-sphere-charcoal font-semibold underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-sphere-charcoal font-semibold underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              icon={ArrowRight}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-sphere-violet hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
