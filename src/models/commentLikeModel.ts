// commentLikeModel.ts

import mongoose, { HydratedDocument, InferSchemaType } from 'mongoose';

const commentLikeSchema = new mongoose.Schema(
    {
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            required: [true, 'A commentLike must liking a comment'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A commentLike must liked by a user'],
        },
    },
    { timestamps: true },
);

commentLikeSchema.index(
    {
        comment: 1,
        user: 1,
    },
    { unique: true },
);

const CommentLikeModel = mongoose.model('CommentLike', commentLikeSchema);

export { CommentLikeModel };
