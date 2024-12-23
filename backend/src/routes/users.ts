import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/userController';
import validate from '../middleware/validate';
import authenticate from '../middleware/authenticate';

const router = express.Router();

// Validation middleware
const updateProfileValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('bio').optional().isString(),
  body('location').optional().isString(),
  body('website').optional().isURL().withMessage('Please enter a valid URL'),
];

// Routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, updateProfileValidation, validate, userController.updateProfile);
router.get('/search', userController.searchUsers);
router.get('/:userId', userController.getUserProfile);

export default router;
