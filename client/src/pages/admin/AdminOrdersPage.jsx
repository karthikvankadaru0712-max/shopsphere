import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  Eye,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Status Change Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined
      };
      const payload = res.data?.data || res.data || {};
      setOrders(payload.orders || []);
      setTotalPages(payload.pagination?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleOpenStatusModal = (ord) => {
    setSelectedOrder(ord);
    setNewStatus(ord.fulfillmentStatus);
    setStatusNote('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      await api.patch(`/admin/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        note: statusNote || undefined
      });
      toast.success(`Order #${selectedOrder.orderNumber} status changed to ${newStatus}`);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600">
            <Truck className="w-3 h-3" /> Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600">
            <Package className="w-3 h-3" /> Processing
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600">
            <Clock className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sphere-border">
        <div>
          <h1 className="text-2xl font-black text-sphere-heading">Orders & Fulfillment</h1>
          <p className="text-sm text-sphere-subtle mt-0.5">
            Process orders, dispatch tracking numbers, and manage lifecycle events.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sphere-subtle" />
            <input
              type="text"
              placeholder="Search by Order #..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-sphere-border bg-sphere-card text-sm text-sphere-heading focus:ring-2 focus:ring-sphere-primary/30 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" size="md">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <select
            className="h-11 px-3 rounded-xl border border-sphere-border bg-sphere-card text-xs font-bold text-sphere-heading outline-none capitalize"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st} className="capitalize">
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-sphere-card border border-sphere-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-sphere-canvas/60 border-b border-sphere-border text-sphere-subtle uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-bold">Order #</th>
                <th className="py-3.5 px-4 font-bold">Customer</th>
                <th className="py-3.5 px-4 font-bold">Placed On</th>
                <th className="py-3.5 px-4 font-bold">Items</th>
                <th className="py-3.5 px-4 font-bold">Total</th>
                <th className="py-3.5 px-4 font-bold">Payment</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sphere-border/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-sphere-subtle animate-pulse">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-sphere-subtle">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-sphere-canvas/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-sphere-primary">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-sphere-heading">{ord.customer?.name || 'Guest / Shopper'}</p>
                      <p className="text-[11px] text-sphere-subtle">{ord.customer?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-sphere-subtle">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sphere-heading font-medium">
                      {ord.items?.length || 0} item(s)
                    </td>
                    <td className="py-3 px-4 font-black text-sphere-heading">
                      ₹{ord.total?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-[11px] font-semibold text-sphere-subtle">
                        {ord.paymentMethod} &bull;{' '}
                        <span className={ord.paymentStatus === 'paid' ? 'text-emerald-600 font-bold' : 'text-amber-500'}>
                          {ord.paymentStatus}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(ord.fulfillmentStatus)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(ord)}
                        className="px-3 py-1.5 rounded-xl bg-sphere-canvas border border-sphere-border text-xs font-bold text-sphere-heading hover:border-sphere-primary hover:text-sphere-primary transition"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-sphere-border flex items-center justify-between">
            <span className="text-xs text-sphere-subtle">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Status Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Update Order #${selectedOrder?.orderNumber}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-sphere-heading mb-1.5">Fulfillment Status</label>
            <select
              className="w-full h-11 px-3 rounded-xl border border-sphere-border bg-sphere-canvas text-sm text-sphere-heading outline-none capitalize"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st} className="capitalize">
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-sphere-heading mb-1.5">
              Status Change Note / Carrier AWB (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Dispatched via BlueDart AWB #98124982. Expected delivery in 48 hours."
              className="w-full p-3 rounded-xl border border-sphere-border bg-sphere-canvas text-xs text-sphere-heading outline-none"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-sphere-border">
            <Button type="button" variant="outline" onClick={() => setSelectedOrder(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={updating}>
              Apply Status Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
