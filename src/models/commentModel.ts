// commentModel.ts

import mongoose, { HydratedDocument, InferSchemaType } from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        story: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Story',
            required: [true, 'A comment must replying to a story'],
        },
        chain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            required: [
                true,
                'A comment must belongs to a comment chain. Set to self if it is the top.',
            ],
            default: function (this: mongoose.Document) {
                return this._id;
            },
            validate: [
                {
                    validator: async function (val: mongoose.Schema.Types.ObjectId) {
                        if ((this as mongoose.Document).get('_id')?.equals?.(val)) return true;
                        const chainComment = await CommentModel.findById(val);

                        // Check1: Only accepts when the chain's story is same as this story
                        if (!chainComment?.story?.equals((this as mongoose.Document).get('story')))
                            return false;

                        return true;
                    },
                    message: "A comment must replying to a story same as its chain's story",
                },
                {
                    validator: async function (val: mongoose.Schema.Types.ObjectId) {
                        if ((this as mongoose.Document).get('_id')?.equals?.(val)) return true;
                        const chainComment = await CommentModel.findById(val);

                        // Check2: Only accepts when the chain's chain is itself (i.e. it is the top level comment)
                        if (!chainComment?.chain?.equals(chainComment._id)) return false;

                        return true;
                    },
                    message:
                        "A comment's chain must be the top-level comment (i.e. chain's chain is itself).",
                },
            ],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
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
    },
    { timestamps: true },
);

commentSchema.index({ story: 1, chain: 1, createdAt: 1 });

type CommentType = InferSchemaType<typeof commentSchema>;
type CommentDoc = HydratedDocument<CommentType>;
interface CommentMethods {
    //
}
type CommentModelType = mongoose.Model<CommentType, {}, CommentMethods>;

// Use pre validate because pre save runs after validation and mongoose will throw no chain / depth error
commentSchema.pre('validate', async function (this: CommentDoc) {
    // We want to initialize 'chain'

    // If the comment is not new, return
    if (!this.isNew) return;

    if (!this.chain) {
        // If the comment has no chain, it is the chain
        this.set('chain', this._id);
    }
});

const CommentModel = mongoose.model('Comment', commentSchema);

export { CommentModel };
export type { CommentType, CommentDoc };
