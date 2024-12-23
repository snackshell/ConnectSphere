import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  replies: mongoose.Types.ObjectId[];
  isEdited: boolean;
  editHistory?: {
    content: string;
    editedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Comment cannot be empty'],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment must belong to a user'],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Comment must belong to a post'],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    replies: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    }],
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
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

// Virtual populate
commentSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

commentSchema.virtual('repliesCount').get(function() {
  return this.replies.length;
});

// Middleware
commentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'name username profileImage',
  });
  next();
});

// Instance methods
commentSchema.methods.toggleLike = async function(userId: mongoose.Types.ObjectId) {
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

// Static methods
commentSchema.statics.getRepliesTree = async function(commentId: mongoose.Types.ObjectId) {
  const replies = await this.aggregate([
    {
      $match: { parentComment: commentId },
    },
    {
      $graphLookup: {
        from: 'comments',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentComment',
        as: 'nested_replies',
        maxDepth: 2,
      },
    },
    {
      $project: {
        content: 1,
        author: 1,
        createdAt: 1,
        likes: 1,
        nested_replies: {
          $slice: ['$nested_replies', 5], // Limit nested replies to 5 per level
        },
      },
    },
  ]);

  return replies;
};

export const Comment: Model<IComment> = mongoose.model<IComment>('Comment', commentSchema);
