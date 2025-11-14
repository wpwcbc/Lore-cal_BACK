// storyController.ts

// Dependencies / Types
import { Request, Response, NextFunction, RequestHandler } from 'express';
// Models
import { StoryModel } from '../models/storyModel';
// My Utils
import { ProblemError } from '../types/problem';
import { makeProblem } from '../utils/problem-builder';
import { StoryLikeModel } from '../models/storyLikeModel';
import { coordToVenue } from '../services/venueService';
import { getTurfOfUser, TurfEntry } from '../services/turfService';
import UserModel from '../models/userModel';
import { debug } from 'console';

// #region GET

// Get all
const getStories = async (req: Request, res: Response) => {
    const me = (req as any).user?._id;
    const stories = await StoryModel.find().lean();

    let data;

    if (!me) {
        data = stories.map((s) => ({ ...s, likedByMe: false }));
    } else {
        const ids = stories.map((s) => s._id);
        const likes = await StoryLikeModel.find({ user: me, story: { $in: ids } })
            .select('story -_id')
            .lean();

        // HashSet for quick check "is inclued?"
        const likeSet = new Set(likes.map((l) => String(l.story)));
        console.log(likeSet);
        data = stories.map((s) => ({ ...s, likedByMe: likeSet.has(String(s._id)) }));
    }

    res.status(200).json({
        status: 'success',
        results: stories.length,
        data: {
            stories: data,
        },
    });
};

// Get one by id

const getStoryById = async (req: Request, res: Response) => {
    console.log('GetById');
    const story = await StoryModel.findById(req.params.storyId);

    // Handling valid ObjectId that doesn’t exist
    if (!story) {
        console.error('You are requesting a valid ObjectId that doesn’t exist');
        throw new ProblemError(
            makeProblem({
                status: 404,
                type: 'https://lore-cal/problems/not-found', // otherwise use a URI you control
                title: 'Story Not Found',
                detail: `No story with id ${req.params.storyId}`,
            }),
        );
    }

    res.status(200).json({
        status: 'success',
        data: {
            story: story,
        },
    });
};

// Get all by user id
const getStoriesByUserId = async (req: Request, res: Response) => {
    const me = (req as any).user?._id;
    const userId = req.params.userId;

    const stories = await StoryModel.find({ author: userId }).lean();

    let data;

    if (!me) {
        data = stories.map((s) => ({ ...s, likedByMe: false }));
    } else {
        const ids = stories.map((s) => s._id);
        const likes = await StoryLikeModel.find({ user: me, story: { $in: ids } })
            .select('story -_id')
            .lean();

        const likeSet = new Set(likes.map((l) => String(l.story)));
        data = stories.map((s) => ({ ...s, likedByMe: likeSet.has(String(s._id)) }));
    }

    res.status(200).json({
        status: 'success',
        results: stories.length,
        data: {
            stories: data,
        },
    });
};

// Get all by Me
const getStoriesByMe = async (protectedReq: Request, res: Response) => {
    const me = (protectedReq as any).user?._id;

    console.log(me);

    const stories = await StoryModel.find({ author: me }).lean();

    let data;

    if (!me) {
        data = stories.map((s) => ({ ...s, likedByMe: false }));
    } else {
        const ids = stories.map((s) => s._id);
        const likes = await StoryLikeModel.find({ user: me, story: { $in: ids } })
            .select('story -_id')
            .lean();

        const likeSet = new Set(likes.map((l) => String(l.story)));
        data = stories.map((s) => ({ ...s, likedByMe: likeSet.has(String(s._id)) }));
    }

    res.status(200).json({
        status: 'success',
        results: stories.length,
        data: {
            stories: data,
        },
    });
};

// #endregion

// #region POST

const createStory = async (protectedReq: Request, res: Response) => {
    const me: string = (protectedReq as any).user._id;

    // Get Venue from Coord
    const venue = await coordToVenue(protectedReq.body.coord.lat, protectedReq.body.coord.lng);

    const story = await StoryModel.create({
        ...protectedReq.body,
        author: me,
        venue: venue,
    });

    const turf: TurfEntry[] = await getTurfOfUser(me);
    await UserModel.findByIdAndUpdate(me, { turf: turf });

    res.status(201).json({
        status: 'success',
        data: { story },
    });
};

// This is for testing authorization
const createAdminAnnouncement = async (req: Request, res: Response) => {
    const story = await StoryModel.create(req.body);
    res.status(201).json({ status: 'success', data: { story } });
};

// #endregion

// #region PATCH

// Update one by id
const updateStory = async (req: Request, res: Response) => {
    const story = await StoryModel.findByIdAndUpdate(req.params.storyId, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            story: story,
        },
    });
};

// #endregion

// #region DELETE

// Delete one by id
const deleteStory = async (req: Request, res: Response) => {
    const deleteResult = await StoryModel.findByIdAndDelete(req.params.storyId);

    res.status(200).json({
        status: 'success',
        data: { deleteResult },
    });
};

export {
    getStories,
    getStoryById,
    getStoriesByUserId,
    getStoriesByMe,
    createStory,
    updateStory,
    deleteStory,
    createAdminAnnouncement,
};
