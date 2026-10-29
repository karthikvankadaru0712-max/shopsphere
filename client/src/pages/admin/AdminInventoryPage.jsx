import React, { useState, useEffect } from 'react';
import {
  Layers,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [search, setSearch] = useState('');

  // Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityChange, setQuantityChange] = useState('');
  const [reason, setReason] = useState('restock');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/inventory', {
        params: { lowStockOnly: lowStockOnly ? 'true' : undefined }
      });
      const payload = res.data?.data || res.data || {};
      setProducts(payload.products || []);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [lowStockOnly]);

  const handleOpenAdjust = (prod) => {
    setSelectedProduct(prod);
    setQuantityChange('');
    setReason('restock');
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !quantityChange || Number(quantityChange) === 0) {
      toast.error('Please enter a non-zero quantity change');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/admin/inventory/adjust', {
        productId: selectedProduct._id,
        quantityChange: Number(quantityChange),
        reason
      });
      toast.success(
        `Adjusted stock for "${selectedProduct.name}" by ${Number(quantityChange) > 0 ? '+' : ''}${quantityChange}`
      );
      setSelectedProduct(null);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.SKU?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sphere-border">
        <div>
          <h1 className="text-2xl font-black text-sphere-heading">Inventory & Stock Movement</h1>
          <p className="text-sm text-sphere-subtle mt-0.5">
            Real-time warehouse tracking, reorder thresholds, and inventory adjustments.
          </p>
        </div>

        <button
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition ${
            lowStockOnly
              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
              : 'bg-sphere-card text-sphere-heading border-sphere-border hover:bg-sphere-canvas'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          {lowStockOnly ? 'Showing Low Stock Only (<= 5)' : 'Filter Low Stock (<= 5)'}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sphere-subtle" />
        <input
          type="text"
          placeholder="Filter by SKU or product name..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-sphere-border bg-sphere-card text-sm text-sphere-heading outline-none focus:ring-2 focus:ring-sphere-primary/30"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-sphere-card border border-sphere-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-sphere-canvas/60 border-b border-sphere-border text-sphere-subtle uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-bold">Product</th>
                <th className="py-3.5 px-4 font-bold">SKU</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Selling Price</th>
                <th className="py-3.5 px-4 font-bold">Current Stock</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sphere-border/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-sphere-subtle animate-pulse">
                    Scanning inventory database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-sphere-subtle">
                    No matching inventory items found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-sphere-canvas/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-sphere-border shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-sphere-heading truncate">{item.name}</p>
                          <p className="text-[11px] text-sphere-subtle">{item.brand?.name || 'ShopSphere'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-sphere-subtle">
                      {item.SKU || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sphere-subtle font-medium">
                      {item.category?.name || 'General'}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-sphere-heading">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-base">
                      {item.stock}
                    </td>
                    <td className="py-3 px-4">
                      {item.stock === 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600">
                          Out of Stock
                        </span>
                      ) : item.stock <= 5 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                          <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenAdjust(item)}
                        className="text-xs font-bold"
                      >
                        Adjust Stock
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Adjust Stock Level"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4 pt-2">
          <div className="p-3 rounded-2xl bg-sphere-canvas border border-sphere-border flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-sphere-heading">{selectedProduct?.name}</p>
              <p className="text-[11px] text-sphere-subtle">SKU: {selectedProduct?.SKU}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-sphere-subtle block">Current Stock</span>
              <span className="text-lg font-black text-sphere-primary">{selectedProduct?.stock}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-sphere-heading mb-1.5">
              Stock Quantity Change (+ to add, - to deduct) *
            </label>
            <input
              type="number"
              placeholder="e.g. 50 (or -10 for write-off)"
              className="w-full h-11 px-3 rounded-xl border border-sphere-border bg-sphere-canvas text-sm font-bold text-sphere-heading outline-none focus:ring-2 focus:ring-sphere-primary/30"
              value={quantityChange}
              onChange={(e) => setQuantityChange(e.target.value)}
              required
            />
            {quantityChange && !isNaN(quantityChange) && (
              <p className="text-xs text-sphere-subtle mt-1.5 font-medium">
                New resulting stock:{' '}
                <strong className="text-sphere-heading">
                  {Math.max(0, (selectedProduct?.stock || 0) + Number(quantityChange))}
                </strong>{' '}
                units.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-sphere-heading mb-1.5">Movement Reason *</label>
            <select
              className="w-full h-11 px-3 rounded-xl border border-sphere-border bg-sphere-canvas text-sm text-sphere-heading outline-none capitalize"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="restock">Warehouse Restock / Inbound Shipment</option>
              <option value="audit_correction">Audit / Physical Count Correction</option>
              <option value="damaged">Damaged / Expired Goods Write-off</option>
              <option value="customer_return">Customer Return Restock</option>
              <option value="manual_adjustment">Other Manual Adjustment</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-sphere-border">
            <Button type="button" variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Apply & Log Movement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
