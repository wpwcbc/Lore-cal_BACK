// commmentController.ts

// Dependencies / Types
import { Request, Response, NextFunction, RequestHandler } from 'express';
// Models
import { CommentDoc, CommentModel, CommentType } from '../models/commentModel';
// My Utils
import { ProblemError } from '../types/problem';
import { makeProblem } from '../utils/problem-builder';
import mongoose from 'mongoose';
import { CommentLikeModel } from '../models/commentLikeModel';

//////////////
// #region GET

// get comments of a story, grouped by chains
type params_getCommentChainsOfStory = {
    story: mongoose.Schema.Types.ObjectId; // ref: Story
};
const getCommentChainsOfStory = async (req: Request, res: Response): Promise<void> => {
    const me = (req as any).user?._id;

    let comments = await CommentModel.find({ story: req.params.storyId })
        .populate({ path: 'author', select: 'name avatarUrl' })
        .sort({
            chain: 1,
            createdAt: 1,
        })
        .lean();

    if (!me) {
        comments = comments.map((c) => ({ ...c, likedByMe: false }));
    } else {
        const ids = comments.map((c) => c._id);
        const likes = await CommentLikeModel.find({ user: me, comment: { $in: ids } })
            .select('comment -_id')
            .lean();

        const likeSet = new Set(likes.map((l) => String(l.comment)));

        comments = comments.map((c) => ({ ...c, likedByMe: likeSet.has(String(c._id)) }));
    }

    const groups = new Map<string, any[]>();
    for (const c of comments) {
        const key = String(c.chain);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(c);
    }

    const result = Array.from(groups.entries()).map(([chainId, items]) => {
        return { chainId, items };
    });

    res.status(200).json({
        status: 'success',
        data: { result: result },
    });
};

// #endregion
/////////////

///////////////
// #region POST

// create comment
// protected: get user in (protectedReq as any).user
type params_createComment = {
    storyId: mongoose.Schema.Types.ObjectId; // ref: Story
};
type req_createComment = {
    chain: mongoose.Schema.Types.ObjectId | null; // ref: Comment
    content: string;
};
const createComment = async (protectedReq: Request, res: Response): Promise<void> => {
    const { chain, content } = protectedReq.body;

    const comment = await CommentModel.create({
        author: (protectedReq as any).user._id,
        story: protectedReq.params.storyId,
        chain: chain,
        content: content,
    });
    await comment.populate({ path: 'author', select: 'name avatarUrl' });

    res.status(201).json({
        status: 'success',
        data: { comment: comment },
    });
};

// #endregion
/////////////

export { getCommentChainsOfStory, createComment };
