"use strict";
// storyController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminAnnouncement = exports.deleteStory = exports.updateStory = exports.createStory = exports.getStoriesByMe = exports.getStoriesByUserId = exports.getStoryById = exports.getStories = void 0;
// Models
const storyModel_1 = require("../models/storyModel");
// My Utils
const problem_1 = require("../types/problem");
const problem_builder_1 = require("../utils/problem-builder");
const storyLikeModel_1 = require("../models/storyLikeModel");
const venueService_1 = require("../services/venueService");
const turfService_1 = require("../services/turfService");
const userModel_1 = __importDefault(require("../models/userModel"));
// #region GET
// Get all
const getStories = async (req, res) => {
    const me = req.user?._id;
    const stories = await storyModel_1.StoryModel.find().lean();
    let data;
    if (!me) {
        data = stories.map((s) => ({ ...s, likedByMe: false }));
    }
    else {
        const ids = stories.map((s) => s._id);
        const likes = await storyLikeModel_1.StoryLikeModel.find({ user: me, story: { $in: ids } })
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
exports.getStories = getStories;
// Get one by id
const getStoryById = async (req, res) => {
    console.log('GetById');
    const story = await storyModel_1.StoryModel.findById(req.params.storyId);
    // Handling valid ObjectId that doesn’t exist
    if (!story) {
        console.error('You are requesting a valid ObjectId that doesn’t exist');
        throw new problem_1.ProblemError((0, problem_builder_1.makeProblem)({
            status: 404,
            type: 'https://lore-cal/problems/not-found', // otherwise use a URI you control
            title: 'Story Not Found',
            detail: `No story with id ${req.params.storyId}`,
        }));
    }
    res.status(200).json({
        status: 'success',
        data: {
            story: story,
        },
    });
};
exports.getStoryById = getStoryById;
// Get all by user id
const getStoriesByUserId = async (req, res) => {
    const me = req.user?._id;
    const userId = req.params.userId;
    const stories = await storyModel_1.StoryModel.find({ author: userId }).lean();
    let data;
    if (!me) {
        data = stories.map((s) => ({ ...s, likedByMe: false }));
    }
    else {
        const ids = stories.map((s) => s._id);
        const likes = await storyLikeModel_1.StoryLikeModel.find({ user: me, story: { $in: ids } })
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
exports.getStoriesByUserId = getStoriesByUserId;
// Get all by Me
const getStoriesByMe = async (protectedReq, res) => {
    const me = protectedReq.user?._id;
    console.log(me);
    const stories = await storyModel_1.StoryModel.find({ author: me }).lean();
    let data;
    if (!me) {
        data = stories.map((s) => ({ ...s, likedByMe: false }));
    }
    else {
        const ids = stories.map((s) => s._id);
        const likes = await storyLikeModel_1.StoryLikeModel.find({ user: me, story: { $in: ids } })
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
exports.getStoriesByMe = getStoriesByMe;
// #endregion
// #region POST
const createStory = async (protectedReq, res) => {
    const me = protectedReq.user._id;
    // Get Venue from Coord
    const venue = await (0, venueService_1.coordToVenue)(protectedReq.body.coord.lat, protectedReq.body.coord.lng);
    const story = await storyModel_1.StoryModel.create({
        ...protectedReq.body,
        author: me,
        venue: venue,
    });
    const turf = await (0, turfService_1.getTurfOfUser)(me);
    await userModel_1.default.findByIdAndUpdate(me, { turf: turf });
    res.status(201).json({
        status: 'success',
        data: { story },
    });
};
exports.createStory = createStory;
// This is for testing authorization
const createAdminAnnouncement = async (req, res) => {
    const story = await storyModel_1.StoryModel.create(req.body);
    res.status(201).json({ status: 'success', data: { story } });
};
exports.createAdminAnnouncement = createAdminAnnouncement;
// #endregion
// #region PATCH
// Update one by id
const updateStory = async (req, res) => {
    const story = await storyModel_1.StoryModel.findByIdAndUpdate(req.params.storyId, req.body, {
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
exports.updateStory = updateStory;
// #endregion
// #region DELETE
// Delete one by id
const deleteStory = async (req, res) => {
    const deleteResult = await storyModel_1.StoryModel.findByIdAndDelete(req.params.storyId);
    res.status(200).json({
        status: 'success',
        data: { deleteResult },
    });
};
exports.deleteStory = deleteStory;
