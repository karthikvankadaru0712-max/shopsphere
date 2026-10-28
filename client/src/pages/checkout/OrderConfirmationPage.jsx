import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, ArrowRight, ShieldCheck, Wrench, FileText } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { InvoiceModal } from '../../components/checkout/InvoiceModal';

export const OrderConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const order = location.state?.order;
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti on page mount
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore if canvas is unsupported
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      {/* Celebration Icon */}
      <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-glow">
        <CheckCircle2 className="w-10 h-10 animate-bounce" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Payment & Order Confirmed
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-sphere-charcoal tracking-tight">
          Thank you for choosing ShopSphere!
        </h1>
        <p className="text-sm text-gray-500">
          Your order has been recorded into MongoDB and scheduled for dispatch.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-card text-left space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
          <div>
            <span className="text-xs text-gray-400 block">Order Reference Number</span>
            <span className="text-base font-extrabold text-sphere-charcoal font-mono">
              {order?.orderNumber || `SPHERE-2026-${id?.slice(0, 8)}`}
            </span>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-gray-400 block">Total Amount</span>
            <span className="text-base font-extrabold text-sphere-violet">
              ₹{(order?.total || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Delivery Address Snapshot */}
        {order?.deliveryAddress && (
          <div className="p-4 bg-sphere-cream rounded-2xl text-xs space-y-1">
            <span className="font-bold text-sphere-charcoal block">Shipping To:</span>
            <p className="text-gray-600">
              {order.deliveryAddress.fullName} — {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.postalCode}
            </p>
          </div>
        )}

        {/* Ownership Hub Callout */}
        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs flex items-start gap-3">
          <Wrench className="w-5 h-5 text-sphere-violet shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-purple-900 block">
              Registered in Ownership Hub & Aftercare
            </span>
            <p className="text-purple-800/80 mt-0.5 leading-snug">
              Your purchased gear is now registered for manufacturer warranty tracking and digital care guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Button
          variant="secondary"
          size="lg"
          icon={FileText}
          onClick={() => setInvoiceOpen(true)}
        >
          View & Print Tax Invoice
        </Button>
        <Link to={`/account/orders/${id || order?._id}`}>
          <Button variant="primary" size="lg" icon={Package}>
            Track Live Shipment Status
          </Button>
        </Link>
        <Link to="/account/product-library">
          <Button variant="outline" size="lg">
            View in Ownership Hub
          </Button>
        </Link>
        <Link to="/shop">
          <Button variant="ghost" size="lg">
            Continue Shopping &rarr;
          </Button>
        </Link>
      </div>

      {/* Official Tax Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        order={order || { _id: id, total: 0 }}
      />
    </div>
  );
};
