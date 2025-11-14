"use strict";
// storyLikeModel.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryLikeModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const storyLikeSchema = new mongoose_1.default.Schema({
    story: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Story',
        required: [true, 'A storyLike must liking a story'],
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A storyLike must liked by a user'],
    },
}, { timestamps: true });
storyLikeSchema.index({
    story: 1,
    user: 1,
}, { unique: true });
const StoryLikeModel = mongoose_1.default.model('StoryLike', storyLikeSchema);
exports.StoryLikeModel = StoryLikeModel;
