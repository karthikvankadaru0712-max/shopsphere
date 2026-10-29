import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, CheckCircle2, Truck, XCircle, RotateCcw } from 'lucide-react';
import api from '../../services/api';

const statusBadge = (status) => {
  switch (status) {
    case 'delivered':
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
    case 'shipped':
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">In Transit</span>;
    case 'confirmed':
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Confirmed</span>;
    case 'cancelled':
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">Cancelled</span>;
    case 'returned':
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Return Requested</span>;
    default:
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800">Processing</span>;
  }
};

export const AccountOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders');
        if (res.success && res.data?.orders) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading your order history...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-soft space-y-4">
        <Package className="w-12 h-12 text-gray-400 mx-auto" />
        <h3 className="text-base font-bold text-sphere-charcoal">No orders placed yet</h3>
        <p className="text-xs text-gray-500">
          When you place an order, its real-time shipping tracking will appear here.
        </p>
        <Link to="/shop" className="inline-block pt-2">
          <button className="px-4 py-2 bg-sphere-charcoal text-white rounded-xl text-xs font-semibold">
            Explore Products
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-6">
      <div>
        <h2 className="text-xl font-bold text-sphere-charcoal">Orders & Shipment Tracking</h2>
        <p className="text-xs text-gray-500 mt-1">
          Review your purchase snapshots, view delivery timelines, and access return requests.
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {orders.map((order) => (
          <div key={order._id} className="py-5 first:pt-0 last:pb-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-sphere-charcoal font-mono">
                  #{order.orderNumber}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(order.fulfillmentStatus)}
                <span className="font-black text-sphere-charcoal">
                  ₹{order.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Line items thumbnail gallery */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                {order.items.map((item, idx) => (
                  <img
                    key={idx}
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                    title={item.name}
                  />
                ))}
              </div>

              <Link
                to={`/account/orders/${order._id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-sphere-violet hover:underline shrink-0"
              >
                <span>Track & Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
