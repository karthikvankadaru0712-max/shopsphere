import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { getGuestId } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    freeShippingThreshold: 2000,
    amountForFreeShipping: 2000,
    appliedCoupon: null
  });
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('shopsphere_budget');
    return saved ? Number(saved) : 15000;
  });

  const updateBudget = (newBudget) => {
    setBudget(newBudget);
    localStorage.setItem('shopsphere_budget', newBudget.toString());
  };

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const guestId = getGuestId();
      const res = await api.get('/cart', {
        params: { guestId: !user ? guestId : undefined }
      });
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, variantId = null, quantity = 1, selectedAttributes = {}) => {
    try {
      const guestId = getGuestId();
      const res = await api.post('/cart/items', {
        productId,
        variantId,
        quantity,
        selectedAttributes,
        guestId: !user ? guestId : undefined
      });
      if (res.success && res.data) {
        setCart(res.data);
        toast.success('Added to bag', { icon: '🛍️' });
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Could not add to cart');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const guestId = getGuestId();
      const res = await api.patch(`/cart/items/${itemId}`, {
        quantity,
        guestId: !user ? guestId : undefined
      });
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const guestId = getGuestId();
      const res = await api.delete(`/cart/items/${itemId}`, {
        params: { guestId: !user ? guestId : undefined }
      });
      if (res.success && res.data) {
        setCart(res.data);
        toast.success('Item removed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove item');
    }
  };

  const applyCoupon = async (code) => {
    try {
      const guestId = getGuestId();
      const res = await api.post('/cart/coupon', {
        code,
        guestId: !user ? guestId : undefined
      });
      if (res.success && res.data) {
        setCart(res.data);
        toast.success(res.message || 'Coupon applied!');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Invalid coupon');
      return { success: false, message: err.message };
    }
  };

  const removeCoupon = async () => {
    try {
      const guestId = getGuestId();
      const res = await api.delete('/cart/coupon', {
        data: { guestId: !user ? guestId : undefined }
      });
      if (res.success && res.data) {
        setCart(res.data);
        toast.success('Coupon removed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove coupon');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        budget,
        updateBudget,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
