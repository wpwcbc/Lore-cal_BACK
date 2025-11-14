"use strict";
// commentLikeController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlikeComment = exports.likeComment = exports.getLikedCommentUsers = void 0;
// Models
const commentLikeModel_1 = require("../models/commentLikeModel");
const commentModel_1 = require("../models/commentModel");
const getLikedCommentUsers = async (req, res) => {
    const story = req.params.storyId;
    const commentLikes = await commentLikeModel_1.CommentLikeModel.find({ story }).sort({ createdAt: -1 }).lean();
    const users = commentLikes.map((l) => l.user);
    res.status(200).json({
        status: 'success',
        data: users,
    });
};
exports.getLikedCommentUsers = getLikedCommentUsers;
const likeComment = async (protectedReq, res) => {
    const comment = protectedReq.params.commentId;
    const user = protectedReq.user._id;
    const updateResult = await commentLikeModel_1.CommentLikeModel.updateOne({ comment, user }, { $setOnInsert: { comment, user } }, { upsert: true });
    if (updateResult.upsertedCount && updateResult.upsertedCount > 0) {
        await commentModel_1.CommentModel.updateOne({ _id: comment }, { $inc: { likeCount: 1 } });
    }
    res.status(201).json({
        status: 'success',
        data: { updateResult },
    });
};
exports.likeComment = likeComment;
const unlikeComment = async (protectedReq, res) => {
    const comment = protectedReq.params.commentId;
    const user = protectedReq.user._id;
    const deleteResult = await commentLikeModel_1.CommentLikeModel.deleteOne({
        comment,
        user,
    });
    if (deleteResult.deletedCount === 1) {
        await commentModel_1.CommentModel.updateOne({ _id: comment }, { $inc: { likeCount: -1 } });
    }
    res.status(200).json({
        status: 'success',
        data: { deleteResult },
    });
};
exports.unlikeComment = unlikeComment;
