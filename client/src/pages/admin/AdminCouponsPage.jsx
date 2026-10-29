import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  CheckCircle2,
  XCircle,
  Calendar,
  Percent,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountAmount: 15,
    minOrderAmount: 999,
    maxDiscount: 1000,
    usageLimit: 500,
    expiresAt: ''
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/coupons');
      const payload = res.data?.data || res.data || {};
      setCoupons(payload.coupons || []);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggle = async (coupon) => {
    try {
      const res = await api.patch(`/admin/coupons/${coupon._id}/toggle`);
      toast.success(res.data.message || 'Coupon status toggled');
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err) {
      toast.error('Failed to toggle coupon');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountAmount) {
      toast.error('Coupon code and discount are required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        discountAmount: Number(formData.discountAmount),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined
      };

      await api.post('/admin/coupons', payload);
      toast.success(`Coupon ${payload.code} created successfully`);
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sphere-border">
        <div>
          <h1 className="text-2xl font-black text-sphere-heading">Promotions & Coupons</h1>
          <p className="text-sm text-sphere-subtle mt-0.5">
            Configure automated discounts, campaign vouchers, and minimum cart thresholds.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="bg-sphere-card border border-sphere-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-sphere-canvas/60 border-b border-sphere-border text-sphere-subtle uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-bold">Code</th>
                <th className="py-3.5 px-4 font-bold">Type</th>
                <th className="py-3.5 px-4 font-bold">Discount Value</th>
                <th className="py-3.5 px-4 font-bold">Min Spend</th>
                <th className="py-3.5 px-4 font-bold">Max Cap</th>
                <th className="py-3.5 px-4 font-bold">Redemptions</th>
                <th className="py-3.5 px-4 font-bold">Expiry</th>
                <th className="py-3.5 px-4 font-bold text-right">Status Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sphere-border/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-sphere-subtle animate-pulse">
                    Loading promotional vouchers...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-sphere-subtle">
                    No active discount coupons configured.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-sphere-canvas/40 transition">
                    <td className="py-3 px-4 font-mono font-black text-sm text-sphere-primary">
                      {c.code}
                    </td>
                    <td className="py-3 px-4 capitalize font-medium text-sphere-subtle">
                      {c.discountType}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-sphere-heading">
                      {c.discountType === 'percentage' ? `${c.discountAmount}% OFF` : `₹${c.discountAmount} OFF`}
                    </td>
                    <td className="py-3 px-4 font-medium text-sphere-heading">
                      ₹{c.minOrderAmount?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="py-3 px-4 text-sphere-subtle">
                      {c.maxDiscount ? `₹${c.maxDiscount.toLocaleString('en-IN')}` : 'No cap'}
                    </td>
                    <td className="py-3 px-4 text-sphere-subtle font-mono">
                      {c.usedCount || 0} / {c.usageLimit || '∞'}
                    </td>
                    <td className="py-3 px-4 text-sphere-subtle">
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'Never'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggle(c)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                          c.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                        }`}
                      >
                        {c.isActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Promotion Coupon">
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <Input
            label="Coupon Code *"
            placeholder="e.g. FLASH25"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-sphere-heading mb-1.5">Discount Type</label>
              <select
                className="w-full h-11 px-3 rounded-xl border border-sphere-border bg-sphere-canvas text-sm text-sphere-heading outline-none capitalize"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <Input
              label={formData.discountType === 'percentage' ? 'Discount % *' : 'Discount ₹ *'}
              type="number"
              placeholder={formData.discountType === 'percentage' ? '20' : '500'}
              value={formData.discountAmount}
              onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Minimum Cart Spend (₹)"
              type="number"
              placeholder="999"
              value={formData.minOrderAmount}
              onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
            />

            <Input
              label="Maximum Discount Cap (₹)"
              type="number"
              placeholder="1000"
              value={formData.maxDiscount}
              onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Total Redemptions Limit"
              type="number"
              placeholder="500"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
            />

            <Input
              label="Expiration Date"
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-sphere-border">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create Promotion
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
