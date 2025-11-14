// commentRoute.ts

// Dependencies
import express from 'express';
import { getMe, getUserById } from '../controllers/userController';
import { protect } from '../controllers/authController';
import { getStoriesByMe, getStoriesByUserId } from '../controllers/storyController';
// Controllers

const userRouter = express.Router();

userRouter //
    .route('/me')
    .get(protect, getMe);

userRouter //
    .route('/:userId')
    .get(getUserById);

userRouter //
    .route('/me/stories')
    .get(protect, getStoriesByMe);

userRouter //
    .route('/:userId/stories')
    .get(getStoriesByUserId);

export { userRouter };
