import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router
  .route('/')
  .get(getNotifications);

router
  .route('/mark-all-read')
  .post(markAllNotificationsAsRead);

router
  .route('/:id')
  .patch(markNotificationAsRead)
  .delete(deleteNotification);

export default router;
