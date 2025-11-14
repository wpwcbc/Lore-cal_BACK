"use strict";
// commmentController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = exports.getCommentChainsOfStory = void 0;
// Models
const commentModel_1 = require("../models/commentModel");
const commentLikeModel_1 = require("../models/commentLikeModel");
const getCommentChainsOfStory = async (req, res) => {
    const me = req.user?._id;
    let comments = await commentModel_1.CommentModel.find({ story: req.params.storyId })
        .populate({ path: 'author', select: 'name avatarUrl' })
        .sort({
        chain: 1,
        createdAt: 1,
    })
        .lean();
    if (!me) {
        comments = comments.map((c) => ({ ...c, likedByMe: false }));
    }
    else {
        const ids = comments.map((c) => c._id);
        const likes = await commentLikeModel_1.CommentLikeModel.find({ user: me, comment: { $in: ids } })
            .select('comment -_id')
            .lean();
        const likeSet = new Set(likes.map((l) => String(l.comment)));
        comments = comments.map((c) => ({ ...c, likedByMe: likeSet.has(String(c._id)) }));
    }
    const groups = new Map();
    for (const c of comments) {
        const key = String(c.chain);
        if (!groups.has(key))
            groups.set(key, []);
        groups.get(key).push(c);
    }
    const result = Array.from(groups.entries()).map(([chainId, items]) => {
        return { chainId, items };
    });
    res.status(200).json({
        status: 'success',
        data: { result: result },
    });
};
exports.getCommentChainsOfStory = getCommentChainsOfStory;
const createComment = async (protectedReq, res) => {
    const { chain, content } = protectedReq.body;
    const comment = await commentModel_1.CommentModel.create({
        author: protectedReq.user._id,
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
exports.createComment = createComment;
