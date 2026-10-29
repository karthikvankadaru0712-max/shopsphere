import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';

const STATUS_COLORS = {
  Delivered: '#10B981',
  Shipped: '#3B82F6',
  Processing: '#7657F6',
  Confirmed: '#F59E0B',
  Pending: '#64748B',
  Cancelled: '#EF4444'
};

const PIE_COLORS = ['#7657F6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899'];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/analytics');
      setData(res.data?.data || res.data || {});
    } catch (err) {
      toast.error('Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  const { socket } = useSocket();

  useEffect(() => {
    fetchAnalytics();

    if (socket) {
      const handleLiveOrder = () => {
        fetchAnalytics();
      };
      socket.on('order:created', handleLiveOrder);
      return () => {
        socket.off('order:created', handleLiveOrder);
      };
    }
  }, [socket]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-sphere-card border border-sphere-border rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-sphere-card border border-sphere-border rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-sphere-card border border-sphere-border rounded-3xl animate-pulse" />
      </div>
    );
  }

  const { kpis, salesOverTime, statusBreakdown, categoryDistribution, recentOrders, topProducts } = data || {};

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-sphere-heading">Executive Overview</h1>
        <p className="text-sm text-sphere-subtle mt-0.5">Real-time performance metrics, sales volume, and operations.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-sphere-card border border-sphere-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-sphere-subtle">Gross Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sphere-heading">
            ₹{kpis?.totalRevenue?.toLocaleString('en-IN') || 0}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Authoritative MongoDB calculations
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-sphere-card border border-sphere-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-sphere-subtle">Total Orders</span>
            <div className="p-2 rounded-xl bg-sphere-accent text-sphere-primary">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sphere-heading">
            {kpis?.totalOrders || 0}
          </div>
          <p className="text-[11px] text-sphere-subtle mt-1 font-medium">
            Avg value: ₹{kpis?.averageOrderValue?.toLocaleString('en-IN') || 0}
          </p>
        </div>

        {/* Total Customers */}
        <div className="p-5 rounded-2xl bg-sphere-card border border-sphere-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-sphere-subtle">Active Customers</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sphere-heading">
            {kpis?.totalCustomers || 0}
          </div>
          <p className="text-[11px] text-sphere-subtle mt-1 font-medium">
            Verified shopper accounts
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-sphere-card border border-sphere-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-sphere-subtle">Low Stock Alerts</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-500">
            {kpis?.lowStockProducts || 0}
          </div>
          <Link
            to="/admin/inventory"
            className="text-[11px] text-sphere-primary font-bold mt-1 inline-flex items-center gap-1 hover:underline"
          >
            Review inventory &rarr;
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Timeline Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-sphere-card border border-sphere-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-black text-sphere-heading">Revenue Timeline</h2>
              <p className="text-xs text-sphere-subtle">Daily transactional revenue from verified paid orders</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-sphere-canvas border border-sphere-border text-xs font-bold text-sphere-subtle">
              Daily
            </span>
          </div>

          <div className="h-64">
            {salesOverTime && salesOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7657F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7657F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7657F6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-sphere-subtle">
                No revenue timeline data yet
              </div>
            )}
          </div>
        </div>

        {/* Fulfillment Distribution */}
        <div className="p-6 rounded-3xl bg-sphere-card border border-sphere-border shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-sphere-heading">Fulfillment Status</h2>
            <p className="text-xs text-sphere-subtle">Current order progression distribution</p>
          </div>

          <div className="h-52 my-auto">
            {statusBreakdown && statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-sphere-subtle">
                No order distribution data
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sphere-border">
            {statusBreakdown?.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[s.name] || PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="text-sphere-subtle font-medium truncate">{s.name}:</span>
                <span className="font-bold text-sphere-heading">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-sphere-card border border-sphere-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-sphere-heading">Recent Orders</h2>
              <p className="text-xs text-sphere-subtle">Latest transactions across the storefront</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-sphere-primary hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-sphere-border text-sphere-subtle uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-bold">Order #</th>
                  <th className="pb-3 font-bold">Customer</th>
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold">Total</th>
                  <th className="pb-3 font-bold">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sphere-border/60">
                {recentOrders?.map((ord) => (
                  <tr key={ord._id} className="hover:bg-sphere-canvas/50 transition">
                    <td className="py-3 font-bold text-sphere-primary">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 font-medium text-sphere-heading">
                      {ord.customer?.name || 'Shopper'}
                    </td>
                    <td className="py-3 text-sphere-subtle">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3 font-black text-sphere-heading">
                      ₹{ord.total?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                        style={{
                          backgroundColor: `${STATUS_COLORS[ord.fulfillmentStatus?.charAt(0).toUpperCase() + ord.fulfillmentStatus?.slice(1)] || '#64748B'}20`,
                          color: STATUS_COLORS[ord.fulfillmentStatus?.charAt(0).toUpperCase() + ord.fulfillmentStatus?.slice(1)] || '#64748B'
                        }}
                      >
                        {ord.fulfillmentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="p-6 rounded-3xl bg-sphere-card border border-sphere-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-sphere-heading">Top Products</h2>
              <p className="text-xs text-sphere-subtle">Best-sellers by sales volume</p>
            </div>
            <Link
              to="/admin/products"
              className="text-xs font-bold text-sphere-primary hover:underline flex items-center gap-1"
            >
              All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {topProducts?.map((prod) => (
              <div key={prod._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-sphere-canvas transition">
                <img
                  src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                  alt={prod.name}
                  className="w-10 h-10 rounded-lg object-cover bg-sphere-canvas border border-sphere-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-sphere-heading truncate">{prod.name}</h4>
                  <p className="text-[11px] text-sphere-subtle">
                    {prod.salesCount || 0} units sold &bull; ₹{prod.price?.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
