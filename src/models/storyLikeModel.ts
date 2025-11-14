// storyLikeModel.ts

import mongoose, { HydratedDocument, InferSchemaType } from 'mongoose';

const storyLikeSchema = new mongoose.Schema(
    {
        story: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Story',
            required: [true, 'A storyLike must liking a story'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A storyLike must liked by a user'],
        },
    },
    { timestamps: true },
);

storyLikeSchema.index(
    {
        story: 1,
        user: 1,
    },
    { unique: true },
);

const StoryLikeModel = mongoose.model('StoryLike', storyLikeSchema);

export { StoryLikeModel };
