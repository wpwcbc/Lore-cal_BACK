"use strict";
// commentModel.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    story: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Story',
        required: [true, 'A comment must replying to a story'],
    },
    chain: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Comment',
        required: [
            true,
            'A comment must belongs to a comment chain. Set to self if it is the top.',
        ],
        default: function () {
            return this._id;
        },
        validate: [
            {
                validator: async function (val) {
                    if (this.get('_id')?.equals?.(val))
                        return true;
                    const chainComment = await CommentModel.findById(val);
                    // Check1: Only accepts when the chain's story is same as this story
                    if (!chainComment?.story?.equals(this.get('story')))
                        return false;
                    return true;
                },
                message: "A comment must replying to a story same as its chain's story",
            },
            {
                validator: async function (val) {
                    if (this.get('_id')?.equals?.(val))
                        return true;
                    const chainComment = await CommentModel.findById(val);
                    // Check2: Only accepts when the chain's chain is itself (i.e. it is the top level comment)
                    if (!chainComment?.chain?.equals(chainComment._id))
                        return false;
                    return true;
                },
                message: "A comment's chain must be the top-level comment (i.e. chain's chain is itself).",
            },
        ],
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A comment must have an author.'],
    },
    content: {
        type: String,
        required: [true, 'A comment must have a content.'],
    },
    likeCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
commentSchema.index({ story: 1, chain: 1, createdAt: 1 });
// Use pre validate because pre save runs after validation and mongoose will throw no chain / depth error
commentSchema.pre('validate', async function () {
    // We want to initialize 'chain'
    // If the comment is not new, return
    if (!this.isNew)
        return;
    if (!this.chain) {
        // If the comment has no chain, it is the chain
        this.set('chain', this._id);
    }
});
const CommentModel = mongoose_1.default.model('Comment', commentSchema);
exports.CommentModel = CommentModel;
