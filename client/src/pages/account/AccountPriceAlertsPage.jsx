import React, { useState, useEffect } from 'react';
import { Bell, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const AccountPriceAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/smart/price-alerts');
      if (res.success && res.data?.alerts) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error('Failed to load price alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/smart/price-alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
      toast.success('Price alert removed');
    } catch (err) {
      toast.error('Failed to delete alert');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-sphere-charcoal">PricePulse™ Target Alerts</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Active price thresholds monitored by the automated background tracking engine.
          </p>
        </div>
        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
          {alerts.length} Active
        </span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Bell className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-sphere-charcoal">No target price alerts set</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Open any product page and click "Set Target Price Alert" in the PricePulse section to monitor price drops.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {alerts.map((alert) => (
            <div key={alert._id} className="py-4 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={alert.product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <Link
                    to={`/product/${alert.product?.slug}`}
                    className="font-bold text-sphere-charcoal hover:text-sphere-violet line-clamp-1"
                  >
                    {alert.product?.name}
                  </Link>
                  <p className="text-gray-400 mt-0.5">
                    Current: ₹{(alert.product?.price || 0).toLocaleString()} • Target: <strong className="text-emerald-600">₹{alert.targetPrice.toLocaleString()}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(alert._id)}
                className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                title="Delete alert"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
