import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { NewsletterSubscription } from '../models/NewsletterSubscription.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, avatar, preferences } = req.body;

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 404, 'User not found');

    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    return successResponse(res, 200, 'Profile updated successfully', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        preferences: user.preferences
      }
    });
  } catch (err) {
    next(err);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const addressData = req.body;

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 404, 'User not found');

    if (addressData.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((a) => (a.isDefault = false));
      addressData.isDefault = true;
    }

    user.addresses.push(addressData);
    await user.save();

    return successResponse(res, 201, 'Address added successfully', { addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;
    const updateData = req.body;

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 404, 'User not found');

    const address = user.addresses.id(addressId);
    if (!address) return errorResponse(res, 404, 'Address not found');

    if (updateData.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    Object.assign(address, updateData);
    await user.save();

    return successResponse(res, 200, 'Address updated', { addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 404, 'User not found');

    user.addresses.pull({ _id: addressId });
    await user.save();

    return successResponse(res, 200, 'Address deleted', { addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    return successResponse(res, 200, 'Notifications retrieved', { notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany({ user: userId }, { read: true });
    } else {
      await Notification.findOneAndUpdate({ _id: id, user: userId }, { read: true });
    }

    return successResponse(res, 200, 'Notification status updated');
  } catch (err) {
    next(err);
  }
};

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, 'Email is required');

    await NewsletterSubscription.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { isActive: true, source: 'homepage' },
      { upsert: true, new: true }
    );

    return successResponse(res, 200, 'Subscribed to ShopSphere updates successfully!');
  } catch (err) {
    next(err);
  }
};
