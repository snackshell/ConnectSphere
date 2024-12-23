import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IConnection extends Document {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  blockedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const connectionSchema = new Schema<IConnection>(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Connection must have a requester'],
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Connection must have a recipient'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ status: 1 });
connectionSchema.index({ requester: 1, status: 1 });
connectionSchema.index({ recipient: 1, status: 1 });

// Middleware
connectionSchema.pre(/^find/, function(next) {
  this.populate([
    {
      path: 'requester',
      select: 'name username profileImage',
    },
    {
      path: 'recipient',
      select: 'name username profileImage',
    },
  ]);
  next();
});

// Static methods
connectionSchema.statics.getConnectionStatus = async function(
  userId1: mongoose.Types.ObjectId,
  userId2: mongoose.Types.ObjectId
) {
  const connection = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 },
    ],
  });

  if (!connection) return null;
  return connection;
};

connectionSchema.statics.getFriendsList = async function(userId: mongoose.Types.ObjectId) {
  const connections = await this.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: 'accepted',
  });

  return connections.map(conn => {
    const friend = conn.requester._id.equals(userId)
      ? conn.recipient
      : conn.requester;
    return friend;
  });
};

connectionSchema.statics.getPendingRequests = async function(userId: mongoose.Types.ObjectId) {
  return await this.find({
    recipient: userId,
    status: 'pending',
  });
};

// Instance methods
connectionSchema.methods.accept = async function() {
  this.status = 'accepted';
  await this.save();

  // Create notifications for both users
  await Notification.createNotification({
    recipient: this.requester,
    sender: this.recipient,
    type: 'friend_request',
    message: 'accepted your friend request',
    link: `/profile/${this.recipient.username}`,
  });
};

connectionSchema.methods.reject = async function() {
  this.status = 'rejected';
  await this.save();
};

connectionSchema.methods.block = async function(blockedBy: mongoose.Types.ObjectId) {
  this.status = 'blocked';
  this.blockedBy = blockedBy;
  await this.save();
};

connectionSchema.methods.unblock = async function() {
  this.status = 'rejected';
  this.blockedBy = undefined;
  await this.save();
};

// Prevent duplicate connections
connectionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingConnection = await this.constructor.findOne({
      $or: [
        { requester: this.requester, recipient: this.recipient },
        { requester: this.recipient, recipient: this.requester },
      ],
    });

    if (existingConnection) {
      throw new Error('Connection already exists between these users');
    }
  }
  next();
});

export const Connection: Model<IConnection> = mongoose.model<IConnection>('Connection', connectionSchema);
