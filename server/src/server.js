import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/environment.js';
import { initSocket } from './socket.js';
import { Product } from './models/Product.js';
import { ensureCatalogSeeded } from './utils/ensureCatalogSeeded.js';
import { seedDatabase } from '../scripts/seed.js';

const startServer = async () => {
  try {
    await connectDB();

    const catalogStatus = await ensureCatalogSeeded({
      Product,
      seedFn: seedDatabase
    });

    if (catalogStatus.seeded) {
      console.log(`[Startup] Catalog was empty — seeded ${catalogStatus.count} products.`);
    }

    const server = http.createServer(app);
    initSocket(server);

    server.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 ShopSphere REST & WebSocket running on http://localhost:${config.port}`);
      console.log(`✨ Environment: ${config.env}`);
      console.log(`🌐 Client Origin: ${config.clientUrl}`);
      console.log(`📊 Health Endpoint: http://localhost:${config.port}/api/v1/health`);
      console.log(`⚡ WebSocket: Ready (Socket.IO enabled)`);
      console.log(`=======================================================`);
    });

    const shutdown = () => {
      console.log('\nGracefully shutting down ShopSphere server...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Fatal error during server startup:', err);
    process.exit(1);
  }
};

startServer();
