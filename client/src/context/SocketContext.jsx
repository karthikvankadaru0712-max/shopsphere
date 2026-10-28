import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket server via proxy or direct URL
    const socketInstance = io(window.location.origin, {
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
