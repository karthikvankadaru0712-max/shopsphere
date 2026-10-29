import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, RotateCcw, AlertCircle, ShoppingBag } from 'lucide-react';
import { Button } from '../common/Button';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const MatchScoreWizard = ({ categories = [] }) => {
  const { addToCart } = useCart();
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState(25000);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priority, setPriority] = useState('balanced');
  const [intendedUse, setIntendedUse] = useState('everyday');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const priorities = [
    { id: 'budget', title: 'Maximum Value for Money', desc: 'Prioritize under-budget options with best features' },
    { id: 'performance', title: 'Peak Acoustic & Hardware Quality', desc: 'Prioritize highest user ratings and premium specs' },
    { id: 'sustainability', title: 'Eco & Repairability Focus', desc: 'Prioritize high repairability scores and recyclable materials' },
    { id: 'balanced', title: 'All-Round Balanced', desc: 'Harmonious blend of price, rating, and durability' },
  ];

  const handleCalculateMatch = async () => {
    try {
      setLoading(true);
      const res = await api.post('/smart/match-score', {
        budget,
        category: selectedCategory || undefined,
        priority,
        intendedUse
      });
      if (res.success && res.data) {
        setResults(res.data.topMatches);
        setStep(5); // Results step
      }
    } catch (err) {
      toast.error(err.message || 'Failed to compute matches');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setResults(null);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-card max-w-4xl mx-auto">
      {/* Wizard Step Indicator */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-8">
        <div>
          <span className="text-xs font-bold text-sphere-violet uppercase tracking-wider">
            Step {step} of 4
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-sphere-charcoal tracking-tight">
            MatchScore™ Product Matcher
          </h2>
        </div>
        {step < 5 && (
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-6 sm:w-8 h-2 rounded-full transition-colors ${
                  s <= step ? 'bg-sphere-violet' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Step 1: Budget */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-sphere-charcoal">What is your target budget?</h3>
            <p className="text-xs text-gray-500 mt-1">
              MatchScore weights items that stay strictly under your ceiling with zero compromise.
            </p>
          </div>

          <div className="text-center py-6 bg-sphere-cream rounded-2xl border border-gray-200/80">
            <span className="text-3xl sm:text-4xl font-extrabold text-sphere-charcoal">
              ₹{budget.toLocaleString()}
            </span>
            <input
              type="range"
              min="2000"
              max="50000"
              step="1000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-3/4 mx-auto block mt-6 accent-sphere-violet"
            />
            <div className="w-3/4 mx-auto flex justify-between text-[11px] text-gray-400 mt-2">
              <span>₹2,000</span>
              <span>₹25,000</span>
              <span>₹50,000</span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" size="lg" onClick={() => setStep(2)}>
              <span>Next: Category</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Category */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-sphere-charcoal">Which gear domain are you exploring?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Select a specific category or leave open for cross-catalogue discovery.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedCategory('')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                !selectedCategory
                  ? 'border-sphere-violet bg-sphere-violet-light/40 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-xs font-bold text-sphere-charcoal block">Any Category</span>
              <span className="text-[11px] text-gray-500">Cross-catalogue search</span>
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedCategory(c._id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedCategory === c._id
                    ? 'border-sphere-violet bg-sphere-violet-light/40 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xs font-bold text-sphere-charcoal block">{c.name}</span>
                <span className="text-[11px] text-gray-500 truncate block">{c.description}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" size="md" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button variant="primary" size="lg" onClick={() => setStep(3)}>
              <span>Next: Priorities</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Priorities */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-sphere-charcoal">What matters most to you?</h3>
            <p className="text-xs text-gray-500 mt-1">
              Our transparent weighted scoring algorithm tailors matches according to this weighting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {priorities.map((p) => (
              <div
                key={p.id}
                onClick={() => setPriority(p.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                  priority === p.id
                    ? 'border-sphere-violet bg-sphere-violet-light/30 ring-2 ring-sphere-violet/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-sphere-charcoal">{p.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-1">{p.desc}</p>
                </div>
                {priority === p.id && (
                  <div className="w-5 h-5 rounded-full bg-sphere-violet text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" size="md" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button variant="primary" size="lg" onClick={() => setStep(4)}>
              <span>Next: Intended Use</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Intended Use & Submit */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-sphere-charcoal">Primary Intended Use Case</h3>
            <p className="text-xs text-gray-500 mt-1">
              Helps calibrate durability, battery, and acoustic trade-offs.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'work', label: 'Office & Desk' },
              { id: 'travel', label: 'Travel & Mobility' },
              { id: 'fitness', label: 'Sports & Active' },
              { id: 'creators', label: 'Studio & Creators' },
            ].map((use) => (
              <button
                key={use.id}
                onClick={() => setIntendedUse(use.id)}
                className={`p-4 rounded-2xl border text-center font-bold text-xs transition-all ${
                  intendedUse === use.id
                    ? 'border-sphere-violet bg-sphere-violet text-white'
                    : 'border-gray-200 text-sphere-charcoal hover:bg-gray-50'
                }`}
              >
                {use.label}
              </button>
            ))}
          </div>

          <div className="p-4 bg-sphere-cream rounded-2xl border border-gray-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Configured Budget:</span>
              <span className="font-bold">₹{budget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Selected Priority:</span>
              <span className="font-bold uppercase text-sphere-violet">{priority}</span>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" size="md" onClick={() => setStep(3)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              size="lg"
              loading={loading}
              onClick={handleCalculateMatch}
              icon={Sparkles}
            >
              Compute Weighted Matches
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Matches Results View */}
      {step === 5 && results && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <h3 className="text-lg font-bold text-sphere-charcoal">
                Top Matches Ranked by Compatibility
              </h3>
            </div>
            <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleReset}>
              Retake Quiz
            </Button>
          </div>

          <div className="space-y-4">
            {results.map((match, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-gray-200 hover:border-sphere-violet/40 bg-white hover:shadow-card transition-all flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={match.product.images[0]}
                    alt={match.product.name}
                    className="w-20 h-20 rounded-xl object-cover bg-gray-50 shrink-0 border"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {match.matchPercentage}% Compatibility
                      </span>
                      <span className="text-xs font-bold text-sphere-violet">
                        ₹{match.product.price.toLocaleString()}
                      </span>
                    </div>

                    <Link to={`/product/${match.product.slug}`} className="hover:text-sphere-violet">
                      <h4 className="text-sm font-bold text-sphere-charcoal">{match.product.name}</h4>
                    </Link>

                    {/* Reasons */}
                    <div className="mt-2 space-y-1">
                      {match.reasons.map((r, i) => (
                        <p key={i} className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                          <Check className="w-3 h-3 shrink-0" />
                          <span>{r}</span>
                        </p>
                      ))}
                      {match.tradeOffs?.map((t, i) => (
                        <p key={i} className="text-[11px] text-amber-700 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>Caveat: {t}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center gap-2 w-full md:w-auto shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 md:flex-none w-full"
                    onClick={() => addToCart(match.product._id, null, 1)}
                    icon={ShoppingBag}
                  >
                    Add to Bag
                  </Button>
                  <Link
                    to={`/product/${match.product.slug}`}
                    className="text-xs text-center font-bold text-sphere-violet hover:underline py-1.5 flex-1 md:flex-none"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
