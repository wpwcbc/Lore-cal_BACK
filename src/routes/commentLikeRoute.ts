// commentLikeRoute.ts

// Dependencies
import express from 'express';
// Controllers
import { protect, restrictTo } from '../controllers/authController';
import {
    getLikedCommentUsers,
    likeComment,
    unlikeComment,
} from '../controllers/commentLikeController';

const commentLikeRouter = express.Router({ mergeParams: true });

commentLikeRouter //
    .route('/')
    .get(getLikedCommentUsers)
    .post(protect, likeComment)
    .delete(protect, unlikeComment);

export { commentLikeRouter };
