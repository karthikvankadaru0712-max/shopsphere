import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopsphere_db',
  jwtSecret: process.env.JWT_SECRET || 'shopsphere_dev_jwt_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'shopsphere_cookie_secret_2026',
  passwordResetSecret: process.env.PASSWORD_RESET_SECRET || 'shopsphere_reset_secret_2026',
  paymentProvider: process.env.PAYMENT_PROVIDER || 'mock',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_shopsphere_demo',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_shopsphere_demo'
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  }
};
