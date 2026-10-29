import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Plus, Share2, Lock, Globe, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const CollectionsPage = () => {
  const { isAuthenticated } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [submitting, setSubmitting] = useState(false);

  const fetchCollections = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/collections/my');
      if (res.success && res.data?.collections) {
        setCollections(res.data.collections);
      }
    } catch (err) {
      console.error('Collections error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [isAuthenticated]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.post('/collections', {
        name: name.trim(),
        description,
        visibility
      });
      if (res.success && res.data?.collection) {
        setCollections([res.data.collection, ...collections]);
        setName('');
        setDescription('');
        setModalOpen(false);
        toast.success('Collection created!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create collection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      await api.delete(`/collections/${id}`);
      setCollections((prev) => prev.filter((c) => c._id !== id));
      toast.success('Collection deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-2">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Distinctive Feature #7</span>
          </div>
          <h1 className="text-3xl font-black text-sphere-charcoal tracking-tight">
            Smart Collections
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Organize dream workspaces, setup blueprints, and share public collections with friends.
          </p>
        </div>

        {isAuthenticated && (
          <Button variant="primary" size="md" icon={Plus} onClick={() => setModalOpen(true)}>
            Create Collection
          </Button>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-soft max-w-md mx-auto space-y-4">
          <Layers className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold">Sign in to manage collections</h3>
          <p className="text-xs text-gray-500">
            Create custom setup lists, share public URLs, and organize your favorite hardware.
          </p>
          <Link to="/login" className="inline-block pt-2">
            <Button variant="primary" size="md">
              Sign In Now
            </Button>
          </Link>
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-soft max-w-md mx-auto space-y-4">
          <Layers className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold">No collections created yet</h3>
          <p className="text-xs text-gray-500">
            Start saving your favorite setups like "My Dream Desk" or "Nomad Travel Gear".
          </p>
          <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
            Create Your First Collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div
              key={col._id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="flex items-center gap-1 font-bold text-gray-500">
                    {col.visibility === 'public' ? (
                      <>
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Public Link</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                        <span>Private</span>
                      </>
                    )}
                  </span>
                  <button
                    onClick={() => handleDelete(col._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link to={`/collections/${col.shareCode || col.slug}`}>
                  <h3 className="text-lg font-bold text-sphere-charcoal hover:text-sphere-violet transition-colors">
                    {col.name}
                  </h3>
                </Link>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {col.description || 'No description provided.'}
                </p>

                {/* Thumbnails preview */}
                <div className="flex gap-2 mt-4 overflow-hidden">
                  {(col.products || []).slice(0, 3).map((p, idx) => (
                    <img
                      key={idx}
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80'}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover bg-gray-50 border border-gray-100"
                    />
                  ))}
                  {(col.products?.length || 0) === 0 && (
                    <span className="text-[11px] text-gray-400 italic">Empty collection</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400">{col.products?.length || 0} items</span>
                <Link
                  to={`/collections/${col.shareCode || col.slug}`}
                  className="font-bold text-sphere-violet hover:underline flex items-center gap-1"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Collection">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Collection Name"
            placeholder="e.g. Minimalist Home Desk Setup"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What makes this setup special?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sphere-violet"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  visibility === 'private'
                    ? 'border-sphere-violet bg-sphere-violet-light text-sphere-violet'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                Private (Only You)
              </button>
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  visibility === 'public'
                    ? 'border-sphere-violet bg-sphere-violet-light text-sphere-violet'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                Public (Shareable Link)
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="md" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={submitting}>
              Create Collection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
