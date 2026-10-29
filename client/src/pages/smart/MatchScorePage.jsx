import React, { useState, useEffect } from 'react';
import { MatchScoreWizard } from '../../components/smart-features/MatchScoreWizard';
import { Sparkles, ShieldCheck, Cpu } from 'lucide-react';
import api from '../../services/api';

export const MatchScorePage = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/catalog/categories');
        if (res.success && res.data?.categories) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories for MatchScore:', err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sphere-violet-light text-sphere-violet text-xs font-bold border border-sphere-violet/20">
          <Sparkles className="w-3.5 h-3.5 text-sphere-amber" />
          <span>Distinctive Feature #4</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-sphere-charcoal tracking-tight">
          MatchScore™ Discovery
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Forget generic star ratings. MatchScore evaluates products against your precise budget, intended use, and priorities using a transparent weighted scoring algorithm.
        </p>
      </div>

      {/* Interactive Wizard */}
      <MatchScoreWizard categories={categories} />

      {/* Algorithm Transparency Card */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-soft max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600">
        <div className="space-y-1">
          <span className="font-bold text-sphere-charcoal block text-sm flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-sphere-violet" />
            <span>Budget Weighting</span>
          </span>
          <p>Strict penalization for exceeding budget; proportional rewards for under-budget efficiency.</p>
        </div>
        <div className="space-y-1">
          <span className="font-bold text-sphere-charcoal block text-sm flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Product Passport Factor</span>
          </span>
          <p>Integrates verified repairability scores and recyclable packaging into product suitability.</p>
        </div>
        <div className="space-y-1">
          <span className="font-bold text-sphere-charcoal block text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Verified Experience</span>
          </span>
          <p>Prioritizes feedback verified directly from delivered customer orders.</p>
        </div>
      </div>
    </div>
  );
};
