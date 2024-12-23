import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPost extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  images?: string[];
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  shares: mongoose.Types.ObjectId[];
  savedBy: mongoose.Types.ObjectId[];
  privacy: 'public' | 'friends' | 'private';
  tags?: string[];
  location?: string;
  views: number;
  isEdited: boolean;
  editHistory?: {
    content: string;
    editedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      required: [true, 'Post content cannot be empty'],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post must belong to a user'],
    },
    images: [{
      type: String,
    }],
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    }],
    shares: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    savedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    privacy: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
    },
    tags: [{
      type: String,
      trim: true,
    }],
    location: String,
    views: {
      type: Number,
      default: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editHistory: [{
      content: String,
      editedAt: Date,
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ content: 'text' });

// Virtual populate
postSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

postSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

postSchema.virtual('sharesCount').get(function() {
  return this.shares.length;
});

// Middleware
postSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'name username profileImage',
  });
  next();
});

// Static methods
postSchema.statics.getPostStats = async function(postId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    {
      $match: { _id: postId },
    },
    {
      $project: {
        likesCount: { $size: '$likes' },
        commentsCount: { $size: '$comments' },
        sharesCount: { $size: '$shares' },
        views: 1,
      },
    },
  ]);

  return stats[0];
};

// Instance methods
postSchema.methods.addView = async function() {
  this.views += 1;
  await this.save();
};

postSchema.methods.toggleLike = async function(userId: mongoose.Types.ObjectId) {
  const userIdStr = userId.toString();
  const index = this.likes.findIndex((id: mongoose.Types.ObjectId) => id.toString() === userIdStr);
  
  if (index === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(index, 1);
  }
  
  await this.save();
  return index === -1;
};

postSchema.methods.toggleSave = async function(userId: mongoose.Types.ObjectId) {
  const userIdStr = userId.toString();
  const index = this.savedBy.findIndex((id: mongoose.Types.ObjectId) => id.toString() === userIdStr);
  
  if (index === -1) {
    this.savedBy.push(userId);
  } else {
    this.savedBy.splice(index, 1);
  }
  
  await this.save();
  return index === -1;
};

export const Post: Model<IPost> = mongoose.model<IPost>('Post', postSchema);
