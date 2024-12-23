import express from 'express';
import { body } from 'express-validator';
import * as postController from '../controllers/postController';
import validate from '../middleware/validate';
import authenticate from '../middleware/authenticate';

const router = express.Router();

// Validation middleware
const createPostValidation = [
  body('content').notEmpty().withMessage('Post content is required'),
];

// Routes
router.post('/', authenticate, createPostValidation, validate, postController.createPost);
router.get('/', authenticate, postController.getFeedPosts);
router.get('/user/:userId', authenticate, postController.getUserPosts);
router.get('/:postId', authenticate, postController.getPost);
router.put('/:postId', authenticate, createPostValidation, validate, postController.updatePost);
router.delete('/:postId', authenticate, postController.deletePost);
router.post('/:postId/like', authenticate, postController.likePost);
router.post('/:postId/unlike', authenticate, postController.unlikePost);

export default router;
