import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, XCircle, RotateCcw, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { InvoiceModal } from '../../components/checkout/InvoiceModal';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // Cancellation Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [cancelling, setCancelling] = useState(false);

  // Return Modal
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('not_as_described');
  const [returnComments, setReturnComments] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.success && res.data?.order) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const res = await api.post(`/orders/${id}/cancel`, { reason: cancelReason });
      if (res.success) {
        toast.success('Order cancelled successfully. Restocked inventory.');
        setCancelModalOpen(false);
        fetchOrder();
      }
    } catch (err) {
      toast.error(err.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestReturn = async () => {
    try {
      setSubmittingReturn(true);
      const res = await api.post(`/orders/${id}/return`, {
        reason: returnReason,
        comments: returnComments
      });
      if (res.success) {
        toast.success('Return request submitted for admin resolution');
        setReturnModalOpen(false);
        fetchOrder();
      }
    } catch (err) {
      toast.error(err.message || 'Return request failed');
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading order details...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center text-xs text-red-500">Order not found.</div>;
  }

  const canCancel = ['processing', 'confirmed'].includes(order.fulfillmentStatus);
  const canReturn = order.fulfillmentStatus === 'delivered';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-8">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <div>
          <Link to="/account/orders" className="text-xs text-gray-400 hover:text-sphere-charcoal flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-sphere-charcoal font-mono">
              #{order.orderNumber}
            </h2>
            <span className="uppercase text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-sphere-violet-light text-sphere-violet">
              {order.fulfillmentStatus}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleString()} via {order.paymentMethod.toUpperCase()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon={FileText} onClick={() => setInvoiceModalOpen(true)}>
            Tax Invoice
          </Button>
          {canCancel && (
            <Button variant="danger" size="sm" onClick={() => setCancelModalOpen(true)}>
              Cancel Order
            </Button>
          )}
          {canReturn && (
            <Button variant="outline" size="sm" icon={RotateCcw} onClick={() => setReturnModalOpen(true)}>
              Request Return
            </Button>
          )}
        </div>
      </div>

      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        order={order}
      />

      {/* Shipment Timeline */}
      <div className="p-5 bg-sphere-cream rounded-2xl border border-gray-200/80 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Shipment Progress History
        </h3>
        <div className="space-y-3">
          {(order.statusHistory || []).map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs">
              <div className="w-5 h-5 rounded-full bg-sphere-violet text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                ✓
              </div>
              <div className="flex-1">
                <span className="font-bold text-sphere-charcoal uppercase">{step.status}</span>
                <p className="text-gray-500 text-[11px] mt-0.5">{step.note}</p>
                <span className="text-[10px] text-gray-400">{new Date(step.changedAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Items in this Package
        </h3>
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl p-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <span className="font-bold text-sphere-charcoal block">{item.name}</span>
                  <span className="text-gray-400">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</span>
                </div>
              </div>
              <span className="font-bold text-sphere-charcoal">
                ₹{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Address & Payment Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
          <span className="font-bold text-sphere-charcoal block mb-1">Delivery Destination:</span>
          <p className="text-gray-600">
            {order.deliveryAddress.fullName}<br />
            {order.deliveryAddress.street}, {order.deliveryAddress.city}<br />
            {order.deliveryAddress.state} - {order.deliveryAddress.postalCode}<br />
            Phone: {order.deliveryAddress.phone}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
          <span className="font-bold text-sphere-charcoal block">Financial Summary:</span>
          <div className="space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span>-₹{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
            </div>
            <div className="flex justify-between font-bold text-sphere-charcoal text-sm pt-2 border-t">
              <span>Total Paid:</span>
              <span className="text-sphere-violet">₹{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Cancel Order">
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Are you sure you want to cancel order #{order.orderNumber}? Reserved stock will be automatically returned to inventory.
          </p>
          <select
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-gray-200"
          >
            <option value="Ordered by mistake">Ordered by mistake</option>
            <option value="Found lower price elsewhere">Found lower price elsewhere</option>
            <option value="Delivery time is too long">Delivery time is too long</option>
            <option value="Other reason">Other reason</option>
          </select>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Order
            </Button>
            <Button variant="danger" size="sm" loading={cancelling} onClick={handleCancelOrder}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Request Modal */}
      <Modal isOpen={returnModalOpen} onClose={() => setReturnModalOpen(false)} title="Submit Return Request">
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            All returned gear is inspected to preserve Product Passport sustainability standards.
          </p>
          <select
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-gray-200"
          >
            <option value="not_as_described">Not as described</option>
            <option value="defective">Defective or damaged</option>
            <option value="wrong_item">Received wrong item</option>
            <option value="changed_mind">Changed my mind</option>
          </select>
          <textarea
            rows={3}
            placeholder="Additional comments for the inspection team..."
            value={returnComments}
            onChange={(e) => setReturnComments(e.target.value)}
            className="w-full p-2.5 text-xs rounded-xl border border-gray-200"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setReturnModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={submittingReturn} onClick={handleRequestReturn}>
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
