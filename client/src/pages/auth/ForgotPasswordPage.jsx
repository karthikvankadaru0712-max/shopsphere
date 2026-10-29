import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.data?.devResetToken) {
        setDevToken(res.data.devResetToken);
      }
      toast.success('Reset instructions dispatched');
    } catch (err) {
      toast.error(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sphere-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-gray-100">
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-sphere-charcoal mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
          <h2 className="text-2xl font-black text-sphere-charcoal tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Enter your email and we'll send a secure single-use token to restore access.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instructions Sent</span>
              </div>
              <p>
                If an account with <strong>{email}</strong> exists, a password reset link has been created.
              </p>
            </div>

            {/* Development token shortcut for review demo */}
            {devToken && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs">
                <span className="font-bold text-purple-900 block mb-1">Development Reset Token:</span>
                <code className="bg-white p-1 rounded border text-[11px] block truncate font-mono">
                  {devToken}
                </code>
                <Link
                  to={`/reset-password?token=${devToken}`}
                  className="mt-2 inline-block font-bold text-sphere-violet underline"
                >
                  Click to proceed directly to Reset Page &rarr;
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Email"
              type="email"
              icon={Mail}
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              icon={ArrowRight}
            >
              Send Reset Instructions
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
