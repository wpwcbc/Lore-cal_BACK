// commentRoute.ts

// Dependencies
import express from 'express';
// Controllers
import { getUser, protect, restrictTo } from '../controllers/authController';
import { createComment, getCommentChainsOfStory } from '../controllers/commentController';
import { commentLikeRouter } from './commentLikeRoute';

////////////////////////////////////
// #region sub-router (under story)

const commentSubRouter = express.Router({ mergeParams: true });

commentSubRouter //
    .route('/')
    .post(protect, createComment);

// Comment-chain
commentSubRouter //
    .route('/chains')
    .get(getCommentChainsOfStory);

// #endregion
/////////////

//////////////////
// #region router

const commentRouter = express.Router();

// Comment like
commentRouter //
    .use('/:commentId/likes', commentLikeRouter);

// #endregion
/////////////

export { commentSubRouter, commentRouter };
