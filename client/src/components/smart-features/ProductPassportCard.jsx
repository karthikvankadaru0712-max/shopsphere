import React from 'react';
import { ShieldCheck, MapPin, Wrench, Package, Sparkles, Award, RotateCcw, Clock } from 'lucide-react';

export const ProductPassportCard = ({ passport = {} }) => {
  const repairability = passport.repairability || 8;

  // Determine repairability bar color
  const getRepairabilityColor = (score) => {
    if (score >= 8) return 'bg-emerald-500 text-emerald-800';
    if (score >= 6) return 'bg-amber-500 text-amber-800';
    return 'bg-red-500 text-red-800';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-sphere-charcoal">Digital Product Passport</h3>
            <p className="text-xs text-gray-500">Verified environmental impact & material transparency</p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          Independently Verified
        </span>
      </div>

      {/* Repairability Index Bar */}
      <div className="p-4 bg-sphere-cream rounded-xl border border-gray-200/80">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1.5 font-bold text-sphere-charcoal">
            <Wrench className="w-4 h-4 text-sphere-violet" />
            <span>Repairability & Serviceability Index</span>
          </div>
          <span className="font-extrabold text-sm text-sphere-charcoal">
            {repairability} / 10
          </span>
        </div>
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden flex">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`h-full flex-1 border-r border-white/40 ${
                i < repairability ? getRepairabilityColor(repairability).split(' ')[0] : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-[11px] text-gray-500 mt-2">
          Modular chassis design with readily accessible user-replaceable components.
        </p>
      </div>

      {/* Grid of Verified Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 flex items-start gap-3">
          <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-gray-400 font-semibold block text-[10px] uppercase tracking-wider">
              Country of Origin
            </span>
            <span className="font-bold text-sphere-charcoal">{passport.origin || 'India'}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 flex items-start gap-3">
          <Package className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-gray-400 font-semibold block text-[10px] uppercase tracking-wider">
              Packaging Standard
            </span>
            <span className="font-bold text-sphere-charcoal">
              {passport.packaging || '100% Recycled Kraft paper packaging'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 flex items-start gap-3">
          <Award className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-gray-400 font-semibold block text-[10px] uppercase tracking-wider">
              Materials Integrity
            </span>
            <span className="font-bold text-sphere-charcoal">
              {passport.materials || 'Aerospace Recycled Aluminum & Bio-Polymers'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-gray-400 font-semibold block text-[10px] uppercase tracking-wider">
              Certified Warranty
            </span>
            <span className="font-bold text-sphere-charcoal">
              {passport.warranty || '1 Year Manufacturer Limited Warranty'}
            </span>
          </div>
        </div>
      </div>

      {/* Care Instructions & Sustainability Claims */}
      <div className="border-t border-gray-100 pt-4 space-y-3 text-xs text-gray-600">
        <div>
          <span className="font-bold text-sphere-charcoal block mb-1">Recommended Care:</span>
          <p className="text-gray-500 leading-relaxed">
            {passport.careInstructions || 'Store in dry conditions. Clean with microfiber cloth.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100 gap-2">
          <span>Audit Source: {passport.verificationSource || 'Independent GreenTech Audits'}</span>
          <span className="flex items-center gap-1 text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Updated: {new Date(passport.lastVerifiedAt || Date.now()).toLocaleDateString()}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
