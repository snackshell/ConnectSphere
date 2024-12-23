import express from 'express';
import {
  sendFriendRequest,
  respondToFriendRequest,
  getFriends,
  getPendingRequests,
  blockUser,
  unblockUser,
} from '../controllers/connectionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router
  .route('/friends')
  .get(getFriends);

router
  .route('/friends/:userId')
  .get(getFriends);

router
  .route('/pending')
  .get(getPendingRequests);

router
  .route('/request')
  .post(sendFriendRequest);

router
  .route('/request/:id/respond')
  .post(respondToFriendRequest);

router
  .route('/block/:userId')
  .post(blockUser)
  .delete(unblockUser);

export default router;
