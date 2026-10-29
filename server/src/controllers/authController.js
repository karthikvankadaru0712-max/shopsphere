import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { Cart } from '../models/Cart.js';
import { generateAuthToken, setAuthCookie, clearAuthCookie, generateResetToken, hashToken } from '../utils/tokenHelper.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { config } from '../config/environment.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 409, 'An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'customer',
      accountStatus: 'active'
    });

    const token = generateAuthToken(user);
    setAuthCookie(res, token);

    // Merge guest cart if guestId provided
    const { guestId } = req.body;
    if (guestId) {
      const guestCart = await Cart.findOne({ guestId });
      if (guestCart && guestCart.items.length > 0) {
        let userCart = await Cart.findOne({ user: user._id });
        if (!userCart) {
          userCart = await Cart.create({ user: user._id, items: [] });
        }
        for (const item of guestCart.items) {
          const existingItem = userCart.items.find(
            (i) => i.product.toString() === item.product.toString() &&
              (i.variantId?.toString() || null) === (item.variantId?.toString() || null)
          );
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            userCart.items.push(item);
          }
        }
        await userCart.save();
        await Cart.deleteOne({ _id: guestCart._id });
      }
    }

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      addresses: user.addresses,
      preferences: user.preferences
    };

    return successResponse(res, 201, 'Account registered successfully', { user: safeUser, token });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, guestId } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password credentials.');
    }

    if (user.accountStatus !== 'active') {
      return errorResponse(res, 403, 'Account is disabled or suspended.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password credentials.');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateAuthToken(user);
    setAuthCookie(res, token);

    // Merge guest cart if guestId provided
    if (guestId) {
      const guestCart = await Cart.findOne({ guestId });
      if (guestCart && guestCart.items.length > 0) {
        let userCart = await Cart.findOne({ user: user._id });
        if (!userCart) {
          userCart = await Cart.create({ user: user._id, items: [] });
        }
        for (const item of guestCart.items) {
          const existingItem = userCart.items.find(
            (i) => i.product.toString() === item.product.toString() &&
              (i.variantId?.toString() || null) === (item.variantId?.toString() || null)
          );
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            userCart.items.push(item);
          }
        }
        await userCart.save();
        await Cart.deleteOne({ _id: guestCart._id });
      }
    }

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      addresses: user.addresses,
      preferences: user.preferences
    };

    return successResponse(res, 200, 'Welcome back to ShopSphere!', { user: safeUser, token });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  clearAuthCookie(res);
  return successResponse(res, 200, 'Logged out successfully');
};

export const getMe = async (req, res) => {
  const safeUser = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar: req.user.avatar,
    addresses: req.user.addresses,
    preferences: req.user.preferences
  };
  return successResponse(res, 200, 'Current session retrieved', { user: safeUser });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success for security (prevent email enumeration)
    if (!user) {
      return successResponse(
        res,
        200,
        'If an account with that email exists, password reset instructions have been dispatched.'
      );
    }

    const { resetToken, tokenHash, expiresAt } = generateResetToken();
    await PasswordResetToken.create({
      user: user._id,
      tokenHash,
      expiresAt
    });

    const isDev = config.env !== 'production';

    return successResponse(
      res,
      200,
      'If an account with that email exists, password reset instructions have been dispatched.',
      isDev ? { devResetToken: resetToken } : null
    );
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const tokenHash = hashToken(token);

    const record = await PasswordResetToken.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!record) {
      return errorResponse(res, 400, 'Password reset token is invalid or has expired.');
    }

    const user = await User.findById(record.user);
    if (!user) {
      return errorResponse(res, 404, 'User account no longer exists.');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    record.used = true;
    await record.save();

    return successResponse(res, 200, 'Password reset successfully. You can now log in with your new password.');
  } catch (err) {
    next(err);
  }
};
