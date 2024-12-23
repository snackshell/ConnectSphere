import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share' | 'friend_request';
  post?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  read: boolean;
  message: string;
  link: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must have a recipient'],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must have a sender'],
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'mention', 'share', 'friend_request'],
      required: [true, 'Notification must have a type'],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    read: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      required: [true, 'Notification must have a message'],
    },
    link: {
      type: String,
      required: [true, 'Notification must have a link'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

// Middleware
notificationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'sender',
    select: 'name username profileImage',
  });
  next();
});

// Static methods
notificationSchema.statics.markAllAsRead = async function(userId: mongoose.Types.ObjectId) {
  await this.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );
};

notificationSchema.statics.getUnreadCount = async function(userId: mongoose.Types.ObjectId) {
  const count = await this.countDocuments({ recipient: userId, read: false });
  return count;
};

// Instance methods
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  await this.save();
};

// Factory method for creating notifications
notificationSchema.statics.createNotification = async function(
  data: {
    recipient: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    type: INotification['type'];
    post?: mongoose.Types.ObjectId;
    comment?: mongoose.Types.ObjectId;
    message: string;
    link: string;
  }
) {
  const notification = await this.create(data);
  
  // Populate sender information before returning
  await notification.populate('sender', 'name username profileImage');
  
  return notification;
};

export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);
