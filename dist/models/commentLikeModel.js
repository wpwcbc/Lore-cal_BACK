"use strict";
// commentLikeModel.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentLikeModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const commentLikeSchema = new mongoose_1.default.Schema({
    comment: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Comment',
        required: [true, 'A commentLike must liking a comment'],
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A commentLike must liked by a user'],
    },
}, { timestamps: true });
commentLikeSchema.index({
    story: 1,
    user: 1,
}, { unique: true });
const CommentLikeModel = mongoose_1.default.model('CommentLike', commentLikeSchema);
exports.CommentLikeModel = CommentLikeModel;
