import React from 'react';
import { X, Printer, ShieldCheck, Leaf, Download } from 'lucide-react';

export const InvoiceModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = order.orderNumber ? `INV-${order.orderNumber}` : `INV-${order._id?.slice(-8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const subtotal = order.subtotal || order.total || 0;
  const discount = order.discount || 0;
  const shipping = order.shipping || 0;
  const tax = order.tax || Math.round(subtotal * 0.18);
  const total = order.total || 0;
  const deliveryAddress = order.deliveryAddress || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Modal Card */}
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Actions Bar (hidden in print) */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-gray-700">Verified Tax Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sphere-charcoal text-white text-xs font-bold hover:bg-sphere-violet transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="shopsphere-invoice-printable" className="p-8 sm:p-10 overflow-y-auto space-y-8 bg-white text-gray-900 font-sans">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-sphere-violet text-white font-black flex items-center justify-center text-sm shadow-xs">
                  S
                </span>
                <span className="text-xl font-black tracking-tight text-gray-900">
                  ShopSphere<span className="text-sphere-violet">.</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">ShopSphere Retail Technologies Pvt. Ltd.</p>
              <p className="text-[10px] text-gray-400">GSTIN: 27AABCS1429B1Z8 | CIN: U74999MH2026PTC198421</p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-black uppercase tracking-wider text-sphere-violet bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                Tax Invoice
              </span>
              <p className="text-sm font-extrabold text-gray-900 mt-1 font-mono">{invoiceNumber}</p>
              <p className="text-[11px] text-gray-500">Date: {orderDate}</p>
              <p className="text-[10px] text-gray-400">Place of Supply: {deliveryAddress.state || 'Maharashtra'}</p>
            </div>
          </div>

          {/* Billing & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-gray-50 text-xs">
            <div>
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">
                Billed & Shipped To:
              </span>
              <p className="font-extrabold text-gray-900 text-sm">{deliveryAddress.fullName || 'Customer'}</p>
              <p className="text-gray-600 mt-0.5">{deliveryAddress.street}</p>
              <p className="text-gray-600">{deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.postalCode}</p>
              {deliveryAddress.phone && <p className="text-gray-500 mt-1">Phone: {deliveryAddress.phone}</p>}
            </div>

            <div className="sm:text-right">
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">
                Payment & Fulfillment
              </span>
              <p className="text-gray-700">
                Method: <span className="font-bold uppercase">{order.paymentMethod || 'Prepaid'}</span>
              </p>
              <p className="text-gray-700">
                Status: <span className="font-bold text-emerald-600 capitalize">{order.paymentStatus || 'Paid'}</span>
              </p>
              <p className="text-gray-700">
                Fulfillment: <span className="font-bold capitalize">{order.fulfillmentStatus || 'Confirmed'}</span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Tax (18% GST)</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {(order.items || []).map((item, idx) => {
                  const itemPrice = item.price || 0;
                  const itemTotal = itemPrice * (item.quantity || 1);
                  const itemTax = Math.round(itemTotal * 0.18);
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-3 px-3">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">SKU: {item.sku || `SKU-${idx + 101}`}</p>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold">{item.quantity}</td>
                      <td className="py-3 px-3 text-right font-medium">₹{Number(itemPrice).toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-gray-500">₹{itemTax.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-bold text-gray-900">₹{itemTotal.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">₹{Number(subtotal).toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount Applied:</span>
                  <span>-₹{Number(discount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Estimated GST (18%):</span>
                <span>₹{Number(tax).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Carbon-Neutral Shipping:</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300 text-sm font-black text-gray-900">
                <span>Grand Total:</span>
                <span className="text-sphere-violet">₹{Number(total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Product Passport & Carbon Neutral Certification Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Leaf className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">100% Carbon-Neutral Order Certified</span>
                <p className="text-[10px] text-emerald-700">1 Tree Planted in partnership with Global Reforestation via ShopSphere Passport.</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-white border border-emerald-300 text-emerald-800">
              Verified Digital Seal
            </span>
          </div>

          {/* Footer Terms */}
          <div className="pt-4 border-t border-gray-100 text-[10px] text-gray-400 text-center space-y-1">
            <p>This is a computer-generated invoice and requires no physical signature under the Information Technology Act.</p>
            <p>For support or returns, visit shopsphere.com/help or email support@shopsphere.com.</p>
          </div>
        </div>
      </div>

      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #shopsphere-invoice-printable, #shopsphere-invoice-printable * {
            visibility: visible;
          }
          #shopsphere-invoice-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            margin: 0;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};
