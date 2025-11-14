"use strict";
// storyLikeController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlikeStory = exports.likeStory = exports.getLikedStoryUsers = void 0;
// Models
const storyLikeModel_1 = require("../models/storyLikeModel");
const storyModel_1 = require("../models/storyModel");
const getLikedStoryUsers = async (req, res) => {
    const story = req.params.storyId;
    const storyLikes = await storyLikeModel_1.StoryLikeModel.find({ story }).sort({ createdAt: -1 }).lean();
    const users = storyLikes.map((l) => l.user);
    res.status(200).json({
        status: 'success',
        data: users,
    });
};
exports.getLikedStoryUsers = getLikedStoryUsers;
const likeStory = async (protectedReq, res) => {
    const story = protectedReq.params.storyId;
    const user = protectedReq.user._id;
    const updateResult = await storyLikeModel_1.StoryLikeModel.updateOne({ story, user }, { $setOnInsert: { story, user } }, { upsert: true });
    if (updateResult.upsertedCount && updateResult.upsertedCount > 0) {
        await storyModel_1.StoryModel.updateOne({ _id: story }, { $inc: { likeCount: 1 } });
    }
    res.status(201).json({
        status: 'success',
        data: { updateResult },
    });
};
exports.likeStory = likeStory;
const unlikeStory = async (protectedReq, res) => {
    const story = protectedReq.params.storyId;
    const user = protectedReq.user._id;
    const deleteResult = await storyLikeModel_1.StoryLikeModel.deleteOne({
        story,
        user,
    });
    if (deleteResult.deletedCount === 1) {
        await storyModel_1.StoryModel.updateOne({ _id: story }, { $inc: { likeCount: -1 } });
    }
    res.status(200).json({
        status: 'success',
        data: deleteResult,
    });
};
exports.unlikeStory = unlikeStory;
