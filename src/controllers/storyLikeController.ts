// storyLikeController.ts

// Dependencies / Types
import { Request, Response, NextFunction, RequestHandler } from 'express';
// Models
import { StoryLikeModel } from '../models/storyLikeModel';
// My Utils
import { ProblemError } from '../types/problem';
import { makeProblem } from '../utils/problem-builder';
import mongoose from 'mongoose';
import { StoryModel } from '../models/storyModel';

///////////////
// #region GET

// get all liked users
type params_getLikedStoryUsers = {
    storyId: mongoose.Schema.Types.ObjectId; // ref: Story
};
const getLikedStoryUsers = async (req: Request, res: Response): Promise<void> => {
    const story = req.params.storyId;

    const storyLikes = await StoryLikeModel.find({ story }).sort({ createdAt: -1 }).lean();

    const users = storyLikes.map((l) => l.user);

    res.status(200).json({
        status: 'success',
        data: users,
    });
};

// #endregion
/////////////

///////////////
// #region POST

// like a story
// protected: get user in (protectedReq as any).user
type params_likeStory = {
    storyId: mongoose.Schema.Types.ObjectId; // ref: Story
};
const likeStory = async (protectedReq: Request, res: Response): Promise<void> => {
    const story = protectedReq.params.storyId;
    const user = (protectedReq as any).user._id;
    const updateResult = await StoryLikeModel.updateOne(
        { story, user },
        { $setOnInsert: { story, user } },
        { upsert: true },
    );

    if (updateResult.upsertedCount && updateResult.upsertedCount > 0) {
        await StoryModel.updateOne({ _id: story }, { $inc: { likeCount: 1 } });
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

// unlike a story
// protected: get user in (protectedReq as any).user
type params_unlikeStory = {
    storyId: mongoose.Schema.Types.ObjectId; // ref: Story
};
const unlikeStory = async (protectedReq: Request, res: Response): Promise<void> => {
    const story = protectedReq.params.storyId;
    const user = (protectedReq as any).user._id;

    const deleteResult = await StoryLikeModel.deleteOne({
        story,
        user,
    });

    if (deleteResult.deletedCount === 1) {
        await StoryModel.updateOne({ _id: story }, { $inc: { likeCount: -1 } });
    }

    res.status(200).json({
        status: 'success',
        data: deleteResult,
    });
};

// #endregion
/////////////

export { getLikedStoryUsers, likeStory, unlikeStory };
