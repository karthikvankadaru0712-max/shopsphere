import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Award,
  Leaf
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import toast from 'react-hot-toast';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <span className="px-3 py-1 rounded-full bg-sphere-accent text-sphere-primary text-xs font-black uppercase tracking-wider">
          Our Philosophy
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-sphere-heading tracking-tight">
          Discover Better. Shop Smarter.
        </h1>
        <p className="text-base text-sphere-subtle max-w-2xl mx-auto leading-relaxed">
          ShopSphere was conceived to dismantle deceptive pricing, low-durability fast commerce, and decision paralysis.
          We build e-commerce infrastructure backed by verifiable data, repairability metrics, and intelligent decision tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-sphere-card border border-sphere-border text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-sphere-accent text-sphere-primary mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-sphere-heading">Algorithmic MatchScore</h3>
          <p className="text-xs text-sphere-subtle leading-relaxed">
            Personalized preference profiling that surfaces products based on your lifestyle, budget, and durability thresholds.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-sphere-card border border-sphere-border text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-sphere-heading">Product Passport</h3>
          <p className="text-xs text-sphere-subtle leading-relaxed">
            Radical supply chain transparency with verified carbon footprints, material breakdowns, and repairability scores from 1 to 10.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-sphere-card border border-sphere-border text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 mx-auto flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-sphere-heading">Ownership Hub</h3>
          <p className="text-xs text-sphere-subtle leading-relaxed">
            Our responsibility doesn't end at checkout. Track device warranties, download user manuals, and log aftercare servicing.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-gradient-to-br from-sphere-card to-sphere-canvas border border-sphere-border space-y-4">
        <h2 className="text-xl font-black text-sphere-heading">Architectural Standards</h2>
        <p className="text-xs text-sphere-subtle leading-relaxed">
          ShopSphere runs on a modern decoupled architecture powered by Node.js, Express, MongoDB Mongoose, and React with Vite.
          Every transaction and checkout recalculates prices authoritatively from our core database engine to ensure zero client-side price tampering.
        </p>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitted(true);
    toast.success('Your message has been dispatched to ShopSphere Concierge!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-black text-sphere-heading">Get in Touch</h1>
        <p className="text-sm text-sphere-subtle max-w-md mx-auto">
          Have an inquiry regarding an order, partnership, or product technicalities? Our team responds within 2 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-sphere-card border border-sphere-border text-center space-y-2">
          <Mail className="w-6 h-6 mx-auto text-sphere-primary" />
          <h4 className="text-xs font-black uppercase tracking-wider text-sphere-heading">Email Support</h4>
          <p className="text-xs text-sphere-subtle">concierge@shopsphere.com</p>
        </div>
        <div className="p-6 rounded-3xl bg-sphere-card border border-sphere-border text-center space-y-2">
          <Phone className="w-6 h-6 mx-auto text-emerald-600" />
          <h4 className="text-xs font-black uppercase tracking-wider text-sphere-heading">Toll-Free Hotline</h4>
          <p className="text-xs text-sphere-subtle">+91 1800 420 7000</p>
        </div>
        <div className="p-6 rounded-3xl bg-sphere-card border border-sphere-border text-center space-y-2">
          <MapPin className="w-6 h-6 mx-auto text-amber-500" />
          <h4 className="text-xs font-black uppercase tracking-wider text-sphere-heading">Headquarters</h4>
          <p className="text-xs text-sphere-subtle">Indiranagar 100ft Rd, Bengaluru</p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-sphere-card border border-sphere-border shadow-sm max-w-xl mx-auto">
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-sphere-heading">Message Received</h3>
            <p className="text-xs text-sphere-subtle">
              We've assigned Ticket #SS-{Math.floor(100000 + Math.random() * 900000)} to your inquiry. Check your inbox for confirmation.
            </p>
            <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
              Send Another Inquiry
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name *"
              placeholder="Alex Johnson"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="alex@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Subject"
              placeholder="Order Inquiry or Question"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <div>
              <label className="block text-xs font-bold text-sphere-heading mb-1.5">Your Message *</label>
              <textarea
                rows={4}
                placeholder="How can our customer success team assist you today?"
                className="w-full p-3 rounded-xl border border-sphere-border bg-sphere-canvas text-xs text-sphere-heading outline-none focus:ring-2 focus:ring-sphere-primary/30"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export function HelpCenterPage() {
  const faqs = [
    {
      q: 'How does the Deal Detective target price alert operate?',
      a: 'When you activate a Target Price Alert on any product page, our price monitoring engine watches for downward price revisions. As soon as the item hits or drops beneath your threshold, you receive an instantaneous email notification and in-app alert.'
    },
    {
      q: 'What is SmartCart and how does the Budget Assistant work?',
      a: 'SmartCart lets you set a spending target before or during shopping. As you add items, our real-time budget meter calculates your total with taxes and delivery. If you exceed your ceiling, the SmartCart assistant suggests alternative products with similar specs at lower price points.'
    },
    {
      q: 'How are verified reviews determined?',
      a: 'Reviews are only marked as "Verified Buyer" if our database verifies an associated order with "paid" status for that specific product linked to your user account.'
    },
    {
      q: 'What is the repairability score on the Product Passport?',
      a: 'The repairability scale (1 to 10) indicates how easily a product can be serviced or disassembled by an authorized technician or DIY enthusiast, evaluating fastener standards, spare parts availability, and documentation.'
    },
    {
      q: 'What payment methods are supported?',
      a: 'We support all major Credit/Debit Cards, UPI, NetBanking, Cash on Delivery, and integrated Razorpay test mode checkout.'
    }
  ];

  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full bg-sphere-accent text-sphere-primary text-xs font-black uppercase tracking-wider">
          Support & Guidance
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-sphere-heading">Help Center & FAQ</h1>
        <p className="text-sm text-sphere-subtle">Everything you need to know about navigating ShopSphere features.</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-sphere-border bg-sphere-card overflow-hidden transition"
          >
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full p-4 text-left flex items-center justify-between font-bold text-sm text-sphere-heading hover:bg-sphere-canvas/40"
            >
              <span>{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-sphere-subtle transition-transform duration-200 ${
                  openIdx === idx ? 'rotate-180 text-sphere-primary' : ''
                }`}
              />
            </button>
            {openIdx === idx && (
              <div className="px-4 pb-4 text-xs text-sphere-subtle leading-relaxed border-t border-sphere-border/50 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShippingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-black text-sphere-heading">Shipping & Delivery Policy</h1>
      <p className="text-xs text-sphere-subtle">Last updated: October 2026</p>

      <div className="space-y-4 text-xs text-sphere-subtle leading-relaxed bg-sphere-card p-6 rounded-3xl border border-sphere-border">
        <h2 className="text-sm font-bold text-sphere-heading">1. Free Shipping Threshold</h2>
        <p>
          We provide complimentary standard shipping on all domestic orders valued at ₹999 or above. Orders below this threshold incur a flat ₹99 handling and logistics fee.
        </p>

        <h2 className="text-sm font-bold text-sphere-heading">2. Dispatch & Transit Timelines</h2>
        <p>
          Orders confirmed before 2:00 PM IST are processed and handed over to logistics partners on the same business day. Delivery typically takes 2 to 4 business days for metropolitan centers, and 4 to 6 business days for regional zones.
        </p>

        <h2 className="text-sm font-bold text-sphere-heading">3. Real-Time Tracking</h2>
        <p>
          As soon as your shipment is dispatched, you will receive an Air Waybill (AWB) number and an automated notification in your ShopSphere Account dashboard.
        </p>
      </div>
    </div>
  );
}

export function ReturnPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-black text-sphere-heading">Returns & Replacements Policy</h1>
      <p className="text-xs text-sphere-subtle">Last updated: October 2026</p>

      <div className="space-y-4 text-xs text-sphere-subtle leading-relaxed bg-sphere-card p-6 rounded-3xl border border-sphere-border">
        <h2 className="text-sm font-bold text-sphere-heading">1. 10-Day Worry-Free Window</h2>
        <p>
          We offer an unconditional 10-day return window from the confirmed date of delivery. Items must be in their original packaging with all included accessories and warranty certificates intact.
        </p>

        <h2 className="text-sm font-bold text-sphere-heading">2. Reverse Pickup Coordination</h2>
        <p>
          You can initiate a return claim directly from your Order Details page. Our logistics courier will schedule a door-step inspection and pickup within 48 hours.
        </p>

        <h2 className="text-sm font-bold text-sphere-heading">3. Instant Refund Settlement</h2>
        <p>
          Once the warehouse approves the returned unit, your refund will be disbursed back to the original payment source within 3 to 5 business days.
        </p>
      </div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-black text-sphere-heading">Privacy & Data Governance</h1>
      <p className="text-xs text-sphere-subtle">Last updated: October 2026</p>

      <div className="space-y-4 text-xs text-sphere-subtle leading-relaxed bg-sphere-card p-6 rounded-3xl border border-sphere-border">
        <h2 className="text-sm font-bold text-sphere-heading">1. Data Minimization</h2>
        <p>
          ShopSphere collects only information essential to fulfill your orders and personalize your shopping experience. Passwords are cryptographically hashed using bcrypt with salt rounds of 12.
        </p>

        <h2 className="text-sm font-bold text-sphere-heading">2. No Third-Party Data Brokering</h2>
        <p>
          We never sell, rent, or trade your personally identifiable information (PII) to ad brokers or external marketing networks.
        </p>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-black text-sphere-heading">Terms of Service</h1>
      <p className="text-xs text-sphere-subtle">Last updated: October 2026</p>

      <div className="space-y-4 text-xs text-sphere-subtle leading-relaxed bg-sphere-card p-6 rounded-3xl border border-sphere-border">
        <h2 className="text-sm font-bold text-sphere-heading">1. Acceptance of Terms</h2>
        <p>
          By accessing and purchasing products on ShopSphere, you agree to comply with our commercial terms and platform usage policies.
        </p>

        <h2 className="text-sm font-bold text-sphere-heading">2. Pricing Integrity</h2>
        <p>
          While we strive for 100% price accuracy, all order charges are validated against authoritative backend database rates prior to transaction capture.
        </p>
      </div>
    </div>
  );
}
