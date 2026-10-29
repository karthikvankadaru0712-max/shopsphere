import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const getSocketServerUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.VITE_API_BASE_URL) {
    try {
      return new URL(import.meta.env.VITE_API_BASE_URL).origin;
    } catch {
      // Ignore invalid URL and fall through to default dev backend.
    }
  }
  return import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin;
};

export const SocketProvider = ({ children }) => {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const isAdmin = auth?.isAdmin ?? false;
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const socketServerUrl = getSocketServerUrl();

    const socketInstance = io(socketServerUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('⚡ [Socket] Connected to ShopSphere Real-Time Hub:', socketInstance.id);

      if (isAdmin) {
        socketInstance.emit('join:admin');
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('⚡ [Socket] Disconnected from Real-Time Hub');
    });

    // Real-Time Notification Listeners
    socketInstance.on('order:created', (data) => {
      toast((t) => (
        <div className="flex items-center gap-3">
          <span className="text-xl">🛍️</span>
          <div>
            <p className="font-bold text-xs text-gray-900">New Live Order #{data.orderId}</p>
            <p className="text-[11px] text-gray-500">
              {data.customerName} placed order for ₹{Number(data.total).toLocaleString()}
            </p>
          </div>
        </div>
      ), { duration: 5000 });
    });

    socketInstance.on('inventory:low_stock', (data) => {
      toast((t) => (
        <div className="flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-bold text-xs text-amber-900">Low Stock Alert</p>
            <p className="text-[11px] text-gray-600">
              "{data.name}" has only {data.stock} units left!
            </p>
          </div>
        </div>
      ), { duration: 6000 });
    });

    socketInstance.on('price:drop', (data) => {
      toast.success(`📉 Price Drop: ${data.productName} is now ₹${data.newPrice.toLocaleString()} (-${data.percentage}%)!`, {
        duration: 5000
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAdmin, user?._id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context || { socket: null, isConnected: false };
};
