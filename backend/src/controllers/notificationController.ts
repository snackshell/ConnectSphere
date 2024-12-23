import { Request, Response } from 'express';
import { Notification } from '../models';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';

export const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ recipient: req.user._id });
  const unreadCount = await Notification.getUnreadCount(req.user._id);

  res.status(200).json({
    status: 'success',
    data: {
      notifications,
      total,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const markNotificationAsRead = catchAsync(async (req: Request, res: Response) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to mark this notification as read', 403);
  }

  await notification.markAsRead();

  res.status(200).json({
    status: 'success',
    data: {
      notification,
    },
  });
});

export const markAllNotificationsAsRead = catchAsync(async (req: Request, res: Response) => {
  await Notification.markAllAsRead(req.user._id);

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
  });
});

export const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to delete this notification', 403);
  }

  await notification.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
