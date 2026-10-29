import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Bell, TrendingDown, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { TargetAlertModal } from './TargetAlertModal';

export const PricePulseChart = ({ history = [], currentPrice = 0, compareAtPrice = null, productId, productName }) => {
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  // Format history data for Recharts
  const chartData = history.map((entry) => ({
    date: new Date(entry.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: entry.price,
    reason: entry.reason
  }));

  // Append current price as latest point if not already
  if (chartData.length === 0 || chartData[chartData.length - 1].price !== currentPrice) {
    chartData.push({
      date: 'Today',
      price: currentPrice,
      reason: 'Current Live Price'
    });
  }

  const lowestPrice = Math.min(...chartData.map((d) => d.price));
  const isLowestEver = currentPrice <= lowestPrice;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="text-base font-bold text-sphere-charcoal">PricePulse Transparency</h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real recorded price history. Never fabricated price drops.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Bell}
          onClick={() => setAlertModalOpen(true)}
          className="text-sphere-violet border-sphere-violet/30 hover:bg-sphere-violet-light self-start sm:self-auto"
        >
          Set Target Price Alert
        </Button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
        <div className="p-3 bg-sphere-cream rounded-xl">
          <span className="text-[11px] text-gray-500 block">Current Price</span>
          <span className="text-base font-extrabold text-sphere-charcoal">
            ₹{currentPrice.toLocaleString()}
          </span>
        </div>

        <div className="p-3 bg-sphere-cream rounded-xl">
          <span className="text-[11px] text-gray-500 block">Lowest Recorded</span>
          <span className="text-base font-extrabold text-emerald-600">
            ₹{lowestPrice.toLocaleString()}
          </span>
        </div>

        <div className="p-3 bg-sphere-cream rounded-xl col-span-2 sm:col-span-1">
          <span className="text-[11px] text-gray-500 block">Status</span>
          <span className="text-xs font-bold text-sphere-charcoal flex items-center gap-1 mt-0.5">
            {isLowestEver ? (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Best Historical Price</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Price Stable</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-48 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7657F6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#7657F6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-sphere-charcoal text-white text-xs p-2.5 rounded-xl shadow-lg border border-white/10">
                      <p className="font-bold text-sphere-violet-light">₹{data.price.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-300 mt-0.5">{data.date}</p>
                      {data.reason && <p className="text-[10px] text-gray-400 mt-0.5 italic">{data.reason}</p>}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#7657F6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-2">
        <span>Recorded automatically on catalogue price calibrations.</span>
        <span className="text-gray-500">Verified by ShopSphere Engine</span>
      </div>

      {/* Target Price Alert Modal */}
      <TargetAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        productId={productId}
        productName={productName}
        currentPrice={currentPrice}
      />
    </div>
  );
};
