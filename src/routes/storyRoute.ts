// storyRoute.ts

// Dependencies
import express from 'express';
// Controllers
import {
    getStories,
    getStoryById,
    createStory,
    updateStory,
    deleteStory,
    createAdminAnnouncement,
} from '../controllers/storyController';
import { getUser, protect, restrictTo } from '../controllers/authController';
import { commentSubRouter } from './commentRoute';
import { storyLikeRouter } from './storyLikeRoute';

const storyRouter = express.Router();

// Param middleware
// router.param('id', (req: Request, res: Response, next: NextFunction, val: string) => {
//     console.log(`story id: ${val}`);
//     next();
// });

storyRouter //
    .route('/admin-announcement')
    .post(protect, restrictTo('admin'), createAdminAnnouncement);

storyRouter //
    .route('/')
    .get(getStories)
    .post(protect, createStory);

storyRouter //
    .route('/:storyId')
    .get(getStoryById)
    .patch(updateStory)
    .delete(deleteStory);

// Comment-chain
storyRouter //
    .use('/:storyId/comments', commentSubRouter);

// StoryLike
storyRouter //
    .use('/:storyId/likes', storyLikeRouter);
export { storyRouter };
