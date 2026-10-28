import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    compareAtPrice: '',
    category: '',
    brand: '',
    stock: 20,
    shortDescription: '',
    description: '',
    images: '',
    badge: 'Trending'
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        search: search.trim() || undefined,
        category: selectedCategory || undefined
      };
      const res = await api.get('/products', { params });
      const payload = res.data?.data || res.data || {};
      setProducts(payload.products || []);
      setTotalPages(payload.pagination?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxonomies = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands')
      ]);
      setCategories(catRes.data.data.categories || []);
      setBrands(brandRes.data.data.brands || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTaxonomies();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      compareAtPrice: '',
      category: categories[0]?._id || '',
      brand: brands[0]?._id || '',
      stock: 25,
      shortDescription: '',
      description: '',
      images: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      badge: 'New Arrival'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || '',
      category: prod.category?._id || prod.category || '',
      brand: prod.brand?._id || prod.brand || '',
      stock: prod.stock,
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
      images: prod.images?.join(', ') || '',
      badge: prod.badge || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        stock: Number(formData.stock),
        images: formData.images.split(',').map((s) => s.trim()).filter(Boolean)
      };

      if (editingProduct) {
        await api.patch(`/admin/products/${editingProduct._id}`, payload);
        toast.success('Product updated (Price history recorded if changed)');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created successfully');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id, name) => {
    if (!window.confirm(`Are you sure you want to archive "${name}"?`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product archived');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to archive product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sphere-border">
        <div>
          <h1 className="text-2xl font-black text-sphere-heading">Product Catalog</h1>
          <p className="text-sm text-sphere-subtle mt-0.5">
            Manage catalog items, pricing, inventory thresholds, and visibility.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Product
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sphere-subtle" />
            <input
              type="text"
              placeholder="Search by title, brand, or SKU..."
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
            className="h-11 px-3 rounded-xl border border-sphere-border bg-sphere-card text-xs font-bold text-sphere-heading outline-none"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-sphere-card border border-sphere-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-sphere-canvas/60 border-b border-sphere-border text-sphere-subtle uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-bold">Item</th>
                <th className="py-3.5 px-4 font-bold">SKU</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Price</th>
                <th className="py-3.5 px-4 font-bold">Stock</th>
                <th className="py-3.5 px-4 font-bold">Badge</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sphere-border/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-sphere-subtle animate-pulse">
                    Loading catalog inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-sphere-subtle">
                    No products matched your criteria.
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-sphere-canvas/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={prod.name}
                          className="w-10 h-10 rounded-xl object-cover border border-sphere-border shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-sphere-heading truncate">{prod.name}</p>
                          <p className="text-[11px] text-sphere-subtle truncate">{prod.brand?.name || 'ShopSphere'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-sphere-subtle">
                      {prod.SKU || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sphere-subtle font-medium">
                      {prod.category?.name || 'General'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-sphere-heading">
                        ₹{prod.price?.toLocaleString('en-IN')}
                      </span>
                      {prod.compareAtPrice && (
                        <span className="text-[10px] text-sphere-subtle line-through block">
                          ₹{prod.compareAtPrice?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          prod.stock <= 5
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {prod.stock <= 5 && <AlertCircle className="w-2.5 h-2.5" />}
                        {prod.stock} left
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {prod.badge ? (
                        <span className="px-2 py-0.5 rounded-full bg-sphere-accent text-sphere-primary text-[10px] font-bold">
                          {prod.badge}
                        </span>
                      ) : (
                        <span className="text-sphere-subtle text-[11px]">&mdash;</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg text-sphere-subtle hover:text-sphere-heading hover:bg-sphere-canvas transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleArchive(prod._id, prod.name)}
                          className="p-1.5 rounded-lg text-sphere-subtle hover:text-rose-500 hover:bg-rose-50 transition"
                          title="Archive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

      {/* Product Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            label="Product Title *"
            placeholder="e.g. Aura Pro ANC Wireless Headphones"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Selling Price (₹) *"
              type="number"
              placeholder="12999"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <Input
              label="MSRP / Original Price (₹)"
              type="number"
              placeholder="15999"
              value={formData.compareAtPrice}
              onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-sphere-heading mb-1.5">Category *</label>
              <select
                className="w-full h-11 px-3 rounded-xl border border-sphere-border bg-sphere-canvas text-sm text-sphere-heading outline-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-sphere-heading mb-1.5">Brand</label>
              <select
                className="w-full h-11 px-3 rounded-xl border border-sphere-border bg-sphere-canvas text-sm text-sphere-heading outline-none"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              >
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Initial Stock *"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
            <Input
              label="Product Badge"
              placeholder="e.g. Trending, Best Seller, New"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            />
          </div>

          <Input
            label="Image URLs (comma-separated)"
            placeholder="https://images.unsplash.com/..., https://..."
            value={formData.images}
            onChange={(e) => setFormData({ ...formData, images: e.target.value })}
          />

          <div>
            <label className="block text-xs font-bold text-sphere-heading mb-1.5">Short Summary</label>
            <textarea
              rows={2}
              className="w-full p-3 rounded-xl border border-sphere-border bg-sphere-canvas text-xs text-sphere-heading outline-none"
              placeholder="One line description highlighting key benefits..."
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-sphere-border">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
