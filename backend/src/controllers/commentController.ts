import { Request, Response } from 'express';
import Comment from '../models/comment';
import Post from '../models/post';

export const createComment = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      content,
      author: userId,
      post: postId,
    });

    await comment.save();
    
    post.comments.push(comment._id);
    await post.save();

    await comment.populate('author', 'name email');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
};

export const getPostComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email');

    const total = await Comment.countDocuments({ post: postId });

    res.json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, author: userId },
      { content },
      { new: true }
    ).populate('author', 'name email');

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    res.json(comment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Error updating comment' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    const comment = await Comment.findOneAndDelete({ _id: commentId, author: userId });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    // Remove comment reference from post
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};
