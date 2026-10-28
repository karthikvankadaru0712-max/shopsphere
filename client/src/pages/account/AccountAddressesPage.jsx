import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2, Home, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AccountAddressesPage() {
  const { user, setUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'home',
    isDefault: false
  });

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      addressType: 'home',
      isDefault: false
    });
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    if (user?.name) {
      setFormData(prev => ({ ...prev, fullName: user.name }));
    }
    setModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingId(addr._id);
    setFormData({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'India',
      addressType: addr.addressType || 'home',
      isDefault: !!addr.isDefault
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.addressLine1 || !formData.city || !formData.postalCode || !formData.phone) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      setLoading(true);
      let res;
      if (editingId) {
        res = await api.patch(`/users/addresses/${editingId}`, formData);
        toast.success('Address updated successfully');
      } else {
        res = await api.post('/users/addresses', formData);
        toast.success('Address added successfully');
      }

      const updatedAddresses = res.data?.addresses || res.data?.data?.addresses;
      if (updatedAddresses) {
        setUser(prev => ({ ...prev, addresses: updatedAddresses }));
      }
      setModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await api.delete(`/users/addresses/${addressId}`);
      toast.success('Address removed');
      const updatedAddresses = res.data?.addresses || res.data?.data?.addresses;
      if (updatedAddresses) {
        setUser(prev => ({ ...prev, addresses: updatedAddresses }));
      }
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      const res = await api.patch(`/users/addresses/${addr._id}`, { ...addr, isDefault: true });
      toast.success('Set as default address');
      const updatedAddresses = res.data?.addresses || res.data?.data?.addresses;
      if (updatedAddresses) {
        setUser(prev => ({ ...prev, addresses: updatedAddresses }));
      }
    } catch (err) {
      toast.error('Failed to set default address');
    }
  };

  const addresses = user?.addresses || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sphere-border">
        <div>
          <h1 className="text-2xl font-black text-sphere-heading">Saved Addresses</h1>
          <p className="text-sm text-sphere-subtle mt-1">Manage delivery locations for quick, 1-click checkout.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="p-12 text-center bg-sphere-card border border-sphere-border rounded-3xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sphere-accent flex items-center justify-center text-sphere-primary">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-sphere-heading">No addresses saved yet</h3>
          <p className="text-xs text-sphere-subtle mt-1 max-w-sm mx-auto">
            Add your primary shipping destination so you can breeze through checkout next time.
          </p>
          <Button onClick={handleOpenAdd} className="mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                addr.isDefault
                  ? 'bg-sphere-card border-sphere-primary shadow-sm'
                  : 'bg-sphere-card/70 border-sphere-border hover:border-sphere-border/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-sphere-canvas text-sphere-subtle">
                      {addr.addressType === 'work' ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-sphere-subtle">
                      {addr.addressType}
                    </span>
                  </div>

                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Default Address
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-extrabold text-sphere-heading">{addr.fullName}</h3>
                <p className="text-xs text-sphere-subtle font-medium mt-0.5">{addr.phone}</p>

                <p className="text-xs text-sphere-subtle mt-2 leading-relaxed">
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                  <br />
                  {addr.city}, {addr.state} - {addr.postalCode}
                  <br />
                  {addr.country}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-sphere-border">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr)}
                    className="text-xs font-bold text-sphere-primary hover:underline"
                  >
                    Set as default
                  </button>
                ) : (
                  <span className="text-xs text-sphere-subtle italic">Primary destination</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(addr)}
                    className="p-1.5 rounded-lg text-sphere-subtle hover:text-sphere-heading hover:bg-sphere-canvas transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="p-1.5 rounded-lg text-sphere-subtle hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Recipient Name *"
              placeholder="e.g. Alex Johnson"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <Input
              label="Phone Number *"
              placeholder="e.g. +91 98765 43210"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <Input
            label="Street Address / Flat No. *"
            placeholder="Flat 402, Skyline Residency, MG Road"
            value={formData.addressLine1}
            onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
            required
          />

          <Input
            label="Landmark / Locality (Optional)"
            placeholder="Near Metro Station"
            value={formData.addressLine2}
            onChange={e => setFormData({ ...formData, addressLine2: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City *"
              placeholder="Bengaluru"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              required
            />
            <Input
              label="State *"
              placeholder="Karnataka"
              value={formData.state}
              onChange={e => setFormData({ ...formData, state: e.target.value })}
              required
            />
            <Input
              label="Postal Code *"
              placeholder="560001"
              value={formData.postalCode}
              onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-sphere-heading mb-1.5">Address Type</label>
              <select
                className="w-full h-11 px-3 rounded-xl border border-sphere-border bg-sphere-canvas text-sm text-sphere-heading focus:ring-2 focus:ring-sphere-primary/30 outline-none"
                value={formData.addressType}
                onChange={e => setFormData({ ...formData, addressType: e.target.value })}
              >
                <option value="home">Home (All-day delivery)</option>
                <option value="work">Work (Office hours delivery)</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-sphere-heading select-none">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded text-sphere-primary focus:ring-sphere-primary"
                />
                Set as default delivery address
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-sphere-border">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingId ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
