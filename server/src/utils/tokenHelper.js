import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/environment.js';

export const generateAuthToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

export const setAuthCookie = (res, token) => {
  const isProduction = config.env === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

export const clearAuthCookie = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
};

export const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { resetToken, tokenHash, expiresAt };
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
