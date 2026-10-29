import React, { useState } from 'react';
import { Gift, Sparkles, ArrowRight, ArrowLeft, RotateCcw, ShoppingBag, Heart, Check } from 'lucide-react';
import { Button } from '../common/Button';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const GiftFinderQuiz = () => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const totalSteps = 4;
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState('Birthday');
  const [recipient, setRecipient] = useState('tech-lover');
  const [budgetRange, setBudgetRange] = useState({ min: 0, max: 15000 });
  const [loading, setLoading] = useState(false);
  const [gifts, setGifts] = useState(null);

  const occasions = [
    'Birthday',
    'Graduation',
    'Housewarming',
    'Anniversary',
    'Promotion / New Job',
    'Just Because'
  ];

  const recipients = [
    { id: 'tech-lover', label: 'Tech & Audio Enthusiast', desc: 'Craves high fidelity & precision engineering' },
    { id: 'student', label: 'College & University Student', desc: 'Focus on durability, portability & study tools' },
    { id: 'creator', label: 'Designer & Content Creator', desc: 'Values aesthetic perfection & studio tools' },
    { id: 'professional', label: 'Remote Professional', desc: 'Ergonomic workspace & focus essentials' },
  ];

  const budgetOptions = [
    { label: 'Thoughtful Under ₹3,000', min: 0, max: 3000 },
    { label: 'Delightful ₹3,000 - ₹10,000', min: 3000, max: 10000 },
    { label: 'Premium ₹10,000 - ₹25,000', min: 10000, max: 25000 },
    { label: 'Luxury Gear ₹25,000+', min: 25000, max: 100000 },
  ];

  const handleFetchGifts = async () => {
    try {
      setLoading(true);
      const res = await api.post('/smart/gift-finder', {
        occasion,
        recipient,
        minPrice: budgetRange.min,
        maxPrice: budgetRange.max
      });
      if (res.success && res.data) {
        setGifts(res.data.gifts);
        setStep(4);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch gift suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-card max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-8">
        <div>
          <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
            Step {step} of {totalSteps}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-sphere-charcoal tracking-tight flex items-center gap-2">
            <Gift className="w-6 h-6 text-rose-500" />
            <span>Interactive Gift Finder</span>
          </h2>
        </div>
        {step < 4 && (
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-8 h-2 rounded-full transition-colors ${
                  s <= step ? 'bg-rose-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Step 1: Occasion */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-sphere-charcoal">What's the occasion?</h3>
            <p className="text-xs text-gray-500 mt-1">Select the celebration to tailor packaging and gifting suitability.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {occasions.map((occ) => (
              <button
                key={occ}
                onClick={() => setOccasion(occ)}
                className={`p-4 rounded-2xl border text-center font-bold text-xs transition-all ${
                  occasion === occ
                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                    : 'border-gray-200 text-sphere-charcoal hover:bg-gray-50'
                }`}
              >
                {occ}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" size="lg" onClick={() => setStep(2)}>
              <span>Next: Recipient</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Recipient Type */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-sphere-charcoal">Who are you shopping for?</h3>
            <p className="text-xs text-gray-500 mt-1">Select their lifestyle focus for pinpoint recommendations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipients.map((r) => (
              <div
                key={r.id}
                onClick={() => setRecipient(r.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                  recipient === r.id
                    ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-sphere-charcoal">{r.label}</h4>
                  <p className="text-[11px] text-gray-500 mt-1">{r.desc}</p>
                </div>
                {recipient === r.id && (
                  <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" size="md" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button variant="primary" size="lg" onClick={() => setStep(3)}>
              <span>Next: Budget</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Budget Bracket */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-sphere-charcoal">Choose your gifting budget</h3>
            <p className="text-xs text-gray-500 mt-1">Pick a bracket to view tailored recommendations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgetOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => setBudgetRange({ min: opt.min, max: opt.max })}
                className={`p-4 rounded-2xl border text-left font-bold text-xs transition-all ${
                  budgetRange.min === opt.min && budgetRange.max === opt.max
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-gray-200 text-sphere-charcoal hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" size="md" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              size="lg"
              loading={loading}
              onClick={handleFetchGifts}
              icon={Sparkles}
            >
              Reveal Handpicked Gifts
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-sphere-charcoal">
                Handpicked Gifts for {occasion}
              </h3>
              <p className="text-xs text-gray-500">
                {gifts?.length
                  ? `Found ${gifts.length} verified products within your chosen budget`
                  : 'No products matched this occasion and budget combination.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={() => {
                setStep(1);
                setGifts(null);
              }}
            >
              Start Over
            </Button>
          </div>

          {!gifts || gifts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Try widening the budget or changing the recipient to see more curated picks.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gifts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-rose-500"
                      >
                        <Heart
                          className={`w-4 h-4 ${isInWishlist(product._id) ? 'fill-rose-500 text-rose-500' : ''}`}
                        />
                      </button>
                    </div>

                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      {product.brand?.name || 'ShopSphere'}
                    </span>
                    <Link
                      to={`/product/${product.slug}`}
                      className="text-xs font-bold text-sphere-charcoal hover:text-sphere-violet line-clamp-2 block"
                    >
                      {product.name}
                    </Link>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                      {product.giftHighlight}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-sphere-charcoal">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => addToCart(product._id, null, 1)}
                      icon={ShoppingBag}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
