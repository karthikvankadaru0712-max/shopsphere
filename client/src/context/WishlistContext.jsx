import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setProducts([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.success && res.data?.products) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (product) => {
    if (!user) {
      toast('Please sign in to save items to your wishlist', { icon: '🔒' });
      return false;
    }

    const productId = typeof product === 'string' ? product : product._id;
    const exists = products.some((p) => p._id === productId);

    try {
      const res = await api.post('/wishlist/toggle', { productId });
      if (res.success) {
        if (exists) {
          setProducts((prev) => prev.filter((p) => p._id !== productId));
          toast.success('Removed from wishlist');
        } else {
          setProducts((prev) => [...prev, typeof product === 'object' ? product : { _id: productId }]);
          toast.success('Saved to wishlist', { icon: '❤️' });
        }
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update wishlist');
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return products.some((p) => p._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist: products,
        count: products.length,
        loading,
        toggleWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
