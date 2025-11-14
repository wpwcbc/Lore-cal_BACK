// storyLikeRoute.ts

// Dependencies
import express, { NextFunction } from 'express';
// Controllers
import { protect, restrictTo } from '../controllers/authController';
import { getLikedStoryUsers, likeStory, unlikeStory } from '../controllers/storyLikeController';

const storyLikeRouter = express.Router({ mergeParams: true });

storyLikeRouter //
    .route('/')
    .get(getLikedStoryUsers)
    .post(protect, likeStory)
    .delete(protect, unlikeStory);

export { storyLikeRouter };
