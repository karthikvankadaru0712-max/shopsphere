import React, { useState, useEffect } from 'react';
import {
  Star,
  Check,
  X,
  ShieldCheck,
  Filter,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { RatingStars } from '../../components/common/RatingStars';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reviews', {
        params: { status: statusFilter }
      });
      const payload = res.data?.data || res.data || {};
      setReviews(payload.reviews || []);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleModerate = async (id, status) => {
    try {
      await api.patch(`/admin/reviews/${id}/moderate`, { status });
      toast.success(`Review ${status}`);
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (err) {
      toast.error('Failed to update review moderation status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sphere-border">
        <div>
          <h1 className="text-2xl font-black text-sphere-heading">Review Moderation Queue</h1>
          <p className="text-sm text-sphere-subtle mt-0.5">
            Audit customer feedback, prevent spam, and maintain community review standards.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === st
                  ? 'bg-sphere-card text-sphere-heading shadow-sm border border-sphere-border'
                  : 'text-sphere-subtle hover:text-sphere-heading'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-sphere-card border border-sphere-border rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center bg-sphere-card border border-sphere-border rounded-3xl">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-sphere-subtle" />
          <h3 className="text-base font-bold text-sphere-heading">No reviews in this queue</h3>
          <p className="text-xs text-sphere-subtle mt-1">All shopper submissions have been processed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="p-5 rounded-3xl bg-sphere-card border border-sphere-border shadow-sm flex flex-col md:flex-row items-start justify-between gap-6"
            >
              <div className="flex-1 space-y-2">
                {/* Product Reference */}
                <div className="flex items-center gap-3 pb-3 border-b border-sphere-border/60">
                  <img
                    src={rev.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                    alt={rev.product?.name}
                    className="w-8 h-8 rounded-lg object-cover bg-sphere-canvas border border-sphere-border"
                  />
                  <span className="text-xs font-bold text-sphere-heading">{rev.product?.name}</span>
                </div>

                {/* Rating & Author */}
                <div className="flex items-center gap-3">
                  <RatingStars rating={rev.rating} size={14} />
                  <h4 className="text-sm font-extrabold text-sphere-heading">{rev.title}</h4>
                  {rev.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> Verified Buyer
                    </span>
                  )}
                </div>

                <p className="text-xs text-sphere-subtle leading-relaxed">{rev.comment}</p>

                <div className="flex items-center gap-4 text-[11px] text-sphere-subtle pt-1">
                  <span>
                    By <strong className="text-sphere-heading">{rev.user?.name || 'Customer'}</strong> ({rev.user?.email})
                  </span>
                  <span>&bull;</span>
                  <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> {rev.helpfulCount || 0} helpful votes
                  </span>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-sphere-border">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    rev.status === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : rev.status === 'rejected'
                      ? 'bg-rose-500/10 text-rose-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {rev.status}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleModerate(rev._id, 'approved')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleModerate(rev._id, 'rejected')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sphere-canvas border border-sphere-border text-rose-600 font-bold text-xs hover:bg-rose-50 transition"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
