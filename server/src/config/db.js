import mongoose from 'mongoose';
import { config } from './environment.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return mongoose.connection;

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB] Connection lost');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Runtime error:', err);
});
