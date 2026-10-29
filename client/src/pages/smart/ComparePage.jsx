import React, { useState, useEffect } from 'react';
import { Sparkles, X, Plus, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { RatingStars } from '../../components/common/RatingStars';
import api from '../../services/api';

export const ComparePage = () => {
  const [catalogue, setCatalogue] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/products?limit=40');
        if (res.success && res.data?.products) {
          setCatalogue(res.data.products);
          // Pick first 3 as initial comparison
          setSelectedIds(res.data.products.slice(0, 3).map((p) => p._id));
        }
      } catch (err) {
        console.error('Failed to load catalogue for comparison:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const selectedProducts = catalogue.filter((p) => selectedIds.includes(p._id));

  const handleAddProduct = (id) => {
    if (selectedIds.length >= 4) return;
    if (!selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveProduct = (id) => {
    setSelectedIds(selectedIds.filter((pId) => pId !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <span className="text-xs font-bold text-sphere-violet uppercase tracking-wider">
            Attribute Transparency
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-sphere-charcoal tracking-tight mt-1">
            Side-by-Side Product Comparison
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Compare prices, specifications, and Digital Product Passports across up to 4 models.
          </p>
        </div>

        {selectedIds.length < 4 && (
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) handleAddProduct(e.target.value);
                e.target.value = '';
              }}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white"
            >
              <option value="">+ Add Product to Compare</option>
              {catalogue
                .filter((p) => !selectedIds.includes(p._id))
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (₹{p.price.toLocaleString()})
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {selectedProducts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Please select products to compare.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse bg-white rounded-3xl overflow-hidden shadow-soft border border-gray-100">
            {/* Header Products */}
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="p-4 w-44 font-bold text-gray-400 uppercase tracking-wider">Metric</th>
                {selectedProducts.map((p) => (
                  <th key={p._id} className="p-4 min-w-[200px] align-top">
                    <div className="relative">
                      <button
                        onClick={() => handleRemoveProduct(p._id)}
                        className="absolute -top-1 -right-1 p-1 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400"
                        title="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <img src={p.images[0]} alt={p.name} className="w-24 h-24 rounded-xl object-cover bg-gray-100 mb-2" />
                      <Link to={`/product/${p.slug}`} className="font-bold text-sphere-charcoal hover:text-sphere-violet line-clamp-2">
                        {p.name}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* Price */}
              <tr>
                <td className="p-4 font-bold text-gray-500 bg-gray-50/30">Price</td>
                {selectedProducts.map((p) => (
                  <td key={p._id} className="p-4 font-black text-sphere-charcoal text-sm">
                    ₹{p.price.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr>
                <td className="p-4 font-bold text-gray-500 bg-gray-50/30">Customer Rating</td>
                {selectedProducts.map((p) => (
                  <td key={p._id} className="p-4">
                    <RatingStars rating={p.ratingSummary?.average || 4.5} count={p.ratingSummary?.count || 12} showValue />
                  </td>
                ))}
              </tr>

              {/* Repairability Index */}
              <tr>
                <td className="p-4 font-bold text-gray-500 bg-gray-50/30">Repairability Score</td>
                {selectedProducts.map((p) => (
                  <td key={p._id} className="p-4">
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      {p.productPassport?.repairability || 8} / 10
                    </span>
                  </td>
                ))}
              </tr>

              {/* Materials */}
              <tr>
                <td className="p-4 font-bold text-gray-500 bg-gray-50/30">Materials</td>
                {selectedProducts.map((p) => (
                  <td key={p._id} className="p-4 text-gray-600">
                    {p.productPassport?.materials || 'Sustainable engineered components'}
                  </td>
                ))}
              </tr>

              {/* Origin */}
              <tr>
                <td className="p-4 font-bold text-gray-500 bg-gray-50/30">Country of Origin</td>
                {selectedProducts.map((p) => (
                  <td key={p._id} className="p-4 text-gray-700 font-semibold">
                    {p.productPassport?.origin || 'India'}
                  </td>
                ))}
              </tr>

              {/* Warranty */}
              <tr>
                <td className="p-4 font-bold text-gray-500 bg-gray-50/30">Certified Warranty</td>
                {selectedProducts.map((p) => (
                  <td key={p._id} className="p-4 text-gray-700 font-semibold">
                    {p.productPassport?.warranty || '1 Year Manufacturer Limited Warranty'}
                  </td>
                ))}
              </tr>

              {/* Action */}
              <tr>
                <td className="p-4 font-bold text-gray-500 bg-gray-50/30">Action</td>
                {selectedProducts.map((p) => (
                  <td key={p._id} className="p-4">
                    <Link to={`/product/${p.slug}`}>
                      <Button variant="primary" size="sm" className="w-full text-xs">
                        View Product
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
