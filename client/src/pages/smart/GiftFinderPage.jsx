import React from 'react';
import { GiftFinderQuiz } from '../../components/smart-features/GiftFinderQuiz';
import { Gift, Sparkles, Heart } from 'lucide-react';

export const GiftFinderPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
          <Gift className="w-3.5 h-3.5 text-rose-500" />
          <span>Distinctive Feature #6</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-sphere-charcoal tracking-tight">
          Intelligent Gift Finder
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Finding the right tech or lifestyle gift shouldn't involve guesswork. Answer 3 quick questions to receive curated recommendations with verified ratings.
        </p>
      </div>

      {/* Quiz */}
      <GiftFinderQuiz />
    </div>
  );
};
