import { Server } from 'socket.io';
import { config } from './config/environment.js';

let io = null;

export const initSocket = (httpServer) => {
  const allowedOrigins = [
    config.clientUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000'
  ];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 30000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    // Client joins appropriate room based on role or interest
    socket.on('join:admin', () => {
      socket.join('admin_channel');
    });

    socket.on('watch:product', (productId) => {
      if (productId) {
        socket.join(`product:${productId}`);
      }
    });

    socket.on('unwatch:product', (productId) => {
      if (productId) {
        socket.leave(`product:${productId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  console.log('[Socket.IO] Real-time engine initialized successfully.');
  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn('[Socket.IO] getIO called before initialization');
  }
  return io;
};

// Broadcast new order creation to admin dashboard
export const broadcastNewOrder = (order) => {
  if (!io) return;
  io.to('admin_channel').emit('order:created', {
    orderId: order.orderNumber || order._id,
    customerName: order.shippingAddress?.fullName || 'Guest Customer',
    total: order.total,
    itemCount: order.items?.length || 1,
    createdAt: new Date().toISOString()
  });
};

// Broadcast low-stock warning to admin
export const broadcastLowStock = (product) => {
  if (!io) return;
  io.to('admin_channel').emit('inventory:low_stock', {
    productId: product._id,
    name: product.name,
    stock: product.stock,
    sku: product.SKU
  });
};

// Broadcast live price drop to product page watchers
export const broadcastPriceDrop = (productId, oldPrice, newPrice, productName) => {
  if (!io) return;
  const percentage = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  io.to(`product:${productId}`).emit('price:drop', {
    productId,
    productName,
    oldPrice,
    newPrice,
    percentage,
    timestamp: new Date().toISOString()
  });
};
