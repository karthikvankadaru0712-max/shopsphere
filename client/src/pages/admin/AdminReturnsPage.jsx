import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resolve Modal
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [newStatus, setNewStatus] = useState('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/returns');
      const payload = res.data?.data || res.data || {};
      setReturns(payload.returns || []);
    } catch (err) {
      toast.error('Failed to load return requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleOpenResolve = (ret) => {
    setSelectedReturn(ret);
    setNewStatus(ret.status === 'requested' ? 'approved' : ret.status);
    setAdminNotes(ret.adminNotes || '');
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReturn) return;
    try {
      setResolving(true);
      await api.patch(`/admin/returns/${selectedReturn._id}/resolve`, {
        status: newStatus,
        adminNotes
      });
      toast.success(`Return request marked as ${newStatus}`);
      setSelectedReturn(null);
      fetchReturns();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update return request');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sphere-border">
        <div>
          <h1 className="text-2xl font-black text-sphere-heading">Return & Exchange Processing</h1>
          <p className="text-sm text-sphere-subtle mt-0.5">
            Evaluate customer return claims, authorize reverse pickups, and manage refunds.
          </p>
        </div>
      </div>

      {/* Return List */}
      <div className="bg-sphere-card border border-sphere-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-sphere-canvas/60 border-b border-sphere-border text-sphere-subtle uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-bold">Request Date</th>
                <th className="py-3.5 px-4 font-bold">Customer</th>
                <th className="py-3.5 px-4 font-bold">Order #</th>
                <th className="py-3.5 px-4 font-bold">Reason</th>
                <th className="py-3.5 px-4 font-bold">Details</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sphere-border/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-sphere-subtle animate-pulse">
                    Loading reverse logistics queue...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-sphere-subtle">
                    No active customer return requests.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret._id} className="hover:bg-sphere-canvas/40 transition">
                    <td className="py-3 px-4 text-sphere-subtle">
                      {new Date(ret.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-sphere-heading">{ret.user?.name || 'Customer'}</p>
                      <p className="text-[11px] text-sphere-subtle">{ret.user?.email}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sphere-primary">
                      {ret.order?.orderNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-4 capitalize font-semibold text-sphere-heading">
                      {ret.reason?.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 text-sphere-subtle max-w-xs truncate">
                      {ret.comment || 'No additional note provided'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          ret.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : ret.status === 'approved'
                            ? 'bg-blue-500/10 text-blue-600'
                            : ret.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenResolve(ret)}
                        className="text-xs font-bold"
                      >
                        Process
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Modal */}
      <Modal
        isOpen={!!selectedReturn}
        onClose={() => setSelectedReturn(null)}
        title="Resolve Return Request"
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-sphere-heading mb-1.5">Decision Status</label>
            <select
              className="w-full h-11 px-3 rounded-xl border border-sphere-border bg-sphere-canvas text-sm text-sphere-heading outline-none capitalize"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="approved">Approved (Initiate Reverse Pickup)</option>
              <option value="rejected">Rejected (Does not meet policy)</option>
              <option value="completed">Completed (Goods received & refund issued)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-sphere-heading mb-1.5">
              Admin Notes / Logistics RMA #
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Approved return. Customer notified of pickup scheduled for tomorrow."
              className="w-full p-3 rounded-xl border border-sphere-border bg-sphere-canvas text-xs text-sphere-heading outline-none"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-sphere-border">
            <Button type="button" variant="outline" onClick={() => setSelectedReturn(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={resolving}>
              Save Decision
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
