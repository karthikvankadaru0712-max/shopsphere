import express from 'express';
import mongoose from 'mongoose';
import { successResponse } from '../utils/responseHelper.js';

const router = express.Router();

router.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  return successResponse(res, 200, 'ShopSphere REST API is healthy and operational', {
    status: 'online',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      connected: isDbConnected,
      name: mongoose.connection.name || 'shopsphere_db'
    },
    version: '1.0.0'
  });
});

export default router;
