import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Tag, ShoppingBag, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function AccountNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/notifications');
      const payload = res.data?.data || res.data || {};
      setNotifications(payload.notifications || []);
      setUnreadCount(payload.unreadCount || 0);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/users/notifications/all/read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/users/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order_update':
        return <ShoppingBag className="w-5 h-5 text-sphere-primary" />;
      case 'price_drop':
        return <Tag className="w-5 h-5 text-amber-500" />;
      case 'warranty_alert':
        return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-sphere-subtle" />;
    }
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sphere-border">
        <div>
          <h1 className="text-2xl font-black text-sphere-heading flex items-center gap-3">
            Notification Center
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sphere-primary text-white font-bold">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-sm text-sphere-subtle mt-1">Real-time alerts for orders, price drops, and account activity.</p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeFilter === 'all'
              ? 'bg-sphere-card text-sphere-heading shadow-sm border border-sphere-border'
              : 'text-sphere-subtle hover:text-sphere-heading'
          }`}
        >
          All Updates ({notifications.length})
        </button>
        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeFilter === 'unread'
              ? 'bg-sphere-card text-sphere-heading shadow-sm border border-sphere-border'
              : 'text-sphere-subtle hover:text-sphere-heading'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-sphere-card border border-sphere-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-sphere-card border border-sphere-border rounded-3xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sphere-accent flex items-center justify-center text-sphere-primary">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-sphere-heading">No notifications found</h3>
          <p className="text-xs text-sphere-subtle mt-1 max-w-sm mx-auto">
            You're all caught up! Order status changes, price drops, and special offers will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div
              key={item._id}
              onClick={() => !item.read && handleMarkAsRead(item._id)}
              className={`p-4 rounded-2xl border transition flex items-start gap-4 cursor-pointer ${
                item.read
                  ? 'bg-sphere-card/50 border-sphere-border/60 hover:bg-sphere-card'
                  : 'bg-sphere-card border-sphere-primary/30 shadow-sm hover:border-sphere-primary/60'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${item.read ? 'bg-sphere-canvas' : 'bg-sphere-accent'}`}>
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-sm font-bold ${item.read ? 'text-sphere-heading/90' : 'text-sphere-heading font-extrabold'}`}>
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-sphere-subtle whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-xs text-sphere-subtle mt-1 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>

                {item.link && (
                  <Link
                    to={item.link}
                    className="inline-flex items-center gap-1 text-xs text-sphere-primary font-bold mt-2 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {!item.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-sphere-primary shrink-0 mt-2" title="Unread" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
