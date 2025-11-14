// commentLikeController.ts

// Dependencies / Types
import { Request, Response, NextFunction, RequestHandler } from 'express';
// Models
import { CommentLikeModel } from '../models/commentLikeModel';
import { CommentModel } from '../models/commentModel';
// My Utils
import { ProblemError } from '../types/problem';
import { makeProblem } from '../utils/problem-builder';
import mongoose from 'mongoose';

///////////////
// #region GET

// get all liked users
type params_getLikedCommentUsers = {
    commentId: mongoose.Schema.Types.ObjectId; // ref: Story
};
const getLikedCommentUsers = async (req: Request, res: Response): Promise<void> => {
    const story = req.params.storyId;

    const commentLikes = await CommentLikeModel.find({ story }).sort({ createdAt: -1 }).lean();

    const users = commentLikes.map((l) => l.user);

    res.status(200).json({
        status: 'success',
        data: users,
    });
};

// #endregion
/////////////

///////////////
// #region POST

// like a comment
// protected: get user in (protectedReq as any).user
type params_likeComment = {
    commentId: mongoose.Schema.Types.ObjectId; // ref: comment
};
const likeComment = async (protectedReq: Request, res: Response): Promise<void> => {
    const comment = protectedReq.params.commentId;
    const user = (protectedReq as any).user._id;
    const updateResult = await CommentLikeModel.updateOne(
        { comment, user },
        { $setOnInsert: { comment, user } },
        { upsert: true },
    );

    if (updateResult.upsertedCount && updateResult.upsertedCount > 0) {
        await CommentModel.updateOne({ _id: comment }, { $inc: { likeCount: 1 } });
    }

    res.status(201).json({
        status: 'success',
        data: { updateResult },
    });
};

// #endregion
/////////////

/////////////////
// #region DELETE

// unlike a comment
// protected: get user in (protectedReq as any).user
type params_unlikeComment = {
    commentId: mongoose.Schema.Types.ObjectId; // ref: comment
};
const unlikeComment = async (protectedReq: Request, res: Response): Promise<void> => {
    const comment = protectedReq.params.commentId;
    const user = (protectedReq as any).user._id;

    const deleteResult = await CommentLikeModel.deleteOne({
        comment,
        user,
    });

    if (deleteResult.deletedCount === 1) {
        await CommentModel.updateOne({ _id: comment }, { $inc: { likeCount: -1 } });
    }

    res.status(200).json({
        status: 'success',
        data: { deleteResult },
    });
};

// #endregion
/////////////

export { getLikedCommentUsers, likeComment, unlikeComment };
