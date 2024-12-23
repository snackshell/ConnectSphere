import express from 'express';
import { body } from 'express-validator';
import * as commentController from '../controllers/commentController';
import validate from '../middleware/validate';
import authenticate from '../middleware/authenticate';

const router = express.Router();

// Validation middleware
const createCommentValidation = [
  body('content').notEmpty().withMessage('Comment content is required'),
];

// Routes
router.post('/:postId', authenticate, createCommentValidation, validate, commentController.createComment);
router.get('/:postId', authenticate, commentController.getPostComments);
router.put('/:commentId', authenticate, createCommentValidation, validate, commentController.updateComment);
router.delete('/:commentId', authenticate, commentController.deleteComment);

export default router;
