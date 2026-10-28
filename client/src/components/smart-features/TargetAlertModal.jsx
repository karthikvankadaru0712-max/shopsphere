import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const TargetAlertModal = ({ isOpen, onClose, productId, productName, currentPrice = 0 }) => {
  const { isAuthenticated } = useAuth();
  const [targetPrice, setTargetPrice] = useState(Math.round(currentPrice * 0.9).toString());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast('Please sign in to set price alerts', { icon: '🔒' });
      return;
    }

    const priceNum = Number(targetPrice);
    if (!priceNum || priceNum >= currentPrice) {
      toast.error(`Target price must be lower than the current price (₹${currentPrice.toLocaleString()})`);
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/smart/price-alerts', {
        productId,
        targetPrice: priceNum
      });
      if (res.success) {
        setSuccess(true);
        toast.success('Target price alert active!');
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to set price alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Target Price Alert"
      subtitle={`Track price drops for ${productName}`}
    >
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-sphere-charcoal">Alert Configured!</h4>
          <p className="text-xs text-gray-500">
            We'll notify your account the moment the price reaches ₹{Number(targetPrice).toLocaleString()} or lower.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-sphere-cream rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Current Price:</span>
              <span className="font-bold text-sphere-charcoal">₹{currentPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Suggested Target (-10%):</span>
              <span className="font-bold text-emerald-600">₹{Math.round(currentPrice * 0.9).toLocaleString()}</span>
            </div>
          </div>

          <Input
            label="Your Target Price (₹)"
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            helperText="You will receive an in-app & email alert as soon as the price hits this threshold."
            required
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={loading} icon={Bell}>
              Save Alert
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
