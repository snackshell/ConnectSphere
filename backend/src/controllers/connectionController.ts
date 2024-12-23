import { Request, Response } from 'express';
import { Connection, User } from '../models';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';

export const sendFriendRequest = catchAsync(async (req: Request, res: Response) => {
  const { recipientId } = req.body;

  if (recipientId === req.user._id.toString()) {
    throw new AppError('You cannot send a friend request to yourself', 400);
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw new AppError('User not found', 404);
  }

  // Check if a connection already exists
  const existingConnection = await Connection.getConnectionStatus(
    req.user._id,
    recipientId
  );

  if (existingConnection) {
    throw new AppError('A connection already exists with this user', 400);
  }

  const connection = await Connection.create({
    requester: req.user._id,
    recipient: recipientId,
  });

  await connection.populate([
    { path: 'requester', select: 'name username profileImage' },
    { path: 'recipient', select: 'name username profileImage' },
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      connection,
    },
  });
});

export const respondToFriendRequest = catchAsync(async (req: Request, res: Response) => {
  const { action } = req.body;
  const connection = await Connection.findById(req.params.id);

  if (!connection) {
    throw new AppError('Friend request not found', 404);
  }

  if (connection.recipient.toString() !== req.user._id.toString()) {
    throw new AppError('You are not authorized to respond to this friend request', 403);
  }

  if (connection.status !== 'pending') {
    throw new AppError('This friend request has already been handled', 400);
  }

  if (action === 'accept') {
    await connection.accept();
  } else if (action === 'reject') {
    await connection.reject();
  } else {
    throw new AppError('Invalid action. Must be either "accept" or "reject"', 400);
  }

  res.status(200).json({
    status: 'success',
    data: {
      connection,
    },
  });
});

export const getFriends = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId || req.user._id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const connections = await Connection.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: 'accepted',
  })
    .populate([
      { path: 'requester', select: 'name username profileImage' },
      { path: 'recipient', select: 'name username profileImage' },
    ])
    .skip(skip)
    .limit(limit);

  const total = await Connection.countDocuments({
    $or: [{ requester: userId }, { recipient: userId }],
    status: 'accepted',
  });

  const friends = connections.map((conn) => {
    return conn.requester._id.toString() === userId.toString()
      ? conn.recipient
      : conn.requester;
  });

  res.status(200).json({
    status: 'success',
    data: {
      friends,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getPendingRequests = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const pendingRequests = await Connection.find({
    recipient: req.user._id,
    status: 'pending',
  })
    .populate('requester', 'name username profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Connection.countDocuments({
    recipient: req.user._id,
    status: 'pending',
  });

  res.status(200).json({
    status: 'success',
    data: {
      pendingRequests,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const blockUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (userId === req.user._id.toString()) {
    throw new AppError('You cannot block yourself', 400);
  }

  let connection = await Connection.getConnectionStatus(req.user._id, userId);

  if (!connection) {
    connection = await Connection.create({
      requester: req.user._id,
      recipient: userId,
      status: 'blocked',
      blockedBy: req.user._id,
    });
  } else {
    await connection.block(req.user._id);
  }

  res.status(200).json({
    status: 'success',
    data: {
      connection,
    },
  });
});

export const unblockUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const connection = await Connection.findOne({
    $or: [
      { requester: req.user._id, recipient: userId },
      { requester: userId, recipient: req.user._id },
    ],
    status: 'blocked',
    blockedBy: req.user._id,
  });

  if (!connection) {
    throw new AppError('No blocking relationship found with this user', 404);
  }

  await connection.unblock();

  res.status(200).json({
    status: 'success',
    data: {
      connection,
    },
  });
});
