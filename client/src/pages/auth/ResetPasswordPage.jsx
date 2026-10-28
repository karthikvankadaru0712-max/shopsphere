import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenParam = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Reset token is required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword
      });
      if (res.success) {
        toast.success('Password updated successfully! You can now log in.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sphere-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-gray-100">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-sphere-charcoal tracking-tight">
            Create New Password
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Choose a strong, unique password with letters and numbers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Reset Token"
            type="text"
            placeholder="Paste reset token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            icon={Lock}
            endIcon={showPassword ? EyeOff : Eye}
            onEndIconClick={() => setShowPassword(!showPassword)}
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            icon={Lock}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            Update Password
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <Link to="/login" className="text-xs text-gray-500 hover:text-sphere-charcoal font-semibold">
            Cancel and Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
