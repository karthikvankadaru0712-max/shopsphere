import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layers, Share2, Globe, Lock, ArrowLeft } from 'lucide-react';
import { ProductCard } from '../../components/products/ProductCard';
import { Button } from '../../components/common/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const CollectionDetailPage = () => {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/collections/${slug}`);
        if (res.success && res.data?.collection) {
          setCollection(res.data.collection);
        }
      } catch (err) {
        setError(err.message || 'Collection not found or private');
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Collection link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4 max-w-sm mx-auto">
          <div className="h-6 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-sphere-charcoal">Private Collection</h2>
        <p className="text-xs text-gray-500">{error || 'This collection is private.'}</p>
        <Link to="/collections">
          <Button variant="outline" size="md">
            Return to Collections
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div className="space-y-1">
          <Link
            to="/collections"
            className="text-xs text-gray-400 hover:text-sphere-charcoal flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Collections</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-sphere-charcoal tracking-tight">
              {collection.name}
            </h1>
            {collection.visibility === 'public' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Public
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Private
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 max-w-xl">
            {collection.description || 'Curated hardware and lifestyle collection.'}
          </p>
        </div>

        {collection.visibility === 'public' && (
          <Button variant="outline" size="sm" icon={Share2} onClick={handleShare}>
            Share Collection
          </Button>
        )}
      </div>

      {/* Products in Collection */}
      {collection.products && collection.products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {collection.products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 text-xs">
          No items have been added to this collection yet.
        </div>
      )}
    </div>
  );
};
