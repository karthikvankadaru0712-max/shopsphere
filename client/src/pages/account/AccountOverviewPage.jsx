import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ShieldCheck, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const AccountOverviewPage = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [budget, setBudget] = useState(user?.preferences?.budget || 15000);
  const [newsletter, setNewsletter] = useState(user?.preferences?.newsletter ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({
      name: name.trim(),
      preferences: {
        budget: Number(budget),
        newsletter
      }
    });
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-8">
      <div>
        <h2 className="text-xl font-bold text-sphere-charcoal">Profile & Preferences</h2>
        <p className="text-xs text-gray-500 mt-1">
          Manage your personal details and calibrate your SmartCart shopping budget.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-xl">
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email Address"
          value={user?.email || ''}
          disabled
          helperText="Email is permanently bound to your order history."
        />

        {/* SmartCart Default Budget */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Default SmartCart Budget (₹)
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sphere-violet"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            This budget will automatically initialize when analyzing bags in SmartCart.
          </p>
        </div>

        {/* Notification preferences */}
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="rounded border-gray-300 text-sphere-violet focus:ring-sphere-violet"
            />
            <span className="text-xs text-gray-700 font-medium">
              Receive quarterly conscious design releases and PricePulse drop notifications.
            </span>
          </label>
        </div>

        <Button type="submit" variant="primary" size="md" loading={saving}>
          Save Preferences
        </Button>
      </form>

      {/* Security Info Card */}
      <div className="p-4 bg-sphere-cream rounded-2xl border border-gray-200/80 text-xs text-gray-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sphere-charcoal block">Secure HTTP-Only Cookie Session</span>
          <p className="mt-0.5">
            Your login token is protected with HTTP-only flags and Strict-Transport security headers, making it immune to malicious client-side script extraction.
          </p>
        </div>
      </div>
    </div>
  );
};
