// storyModel.ts

import { MongoGCPError } from 'mongodb';
import mongoose, { HydratedDocument, InferSchemaType } from 'mongoose';

const storySchema = new mongoose.Schema(
    {
        coord: {
            lat: {
                type: Number,
                required: [true, 'A story must have a latitude'],
            },
            lng: {
                type: Number,
                required: [true, 'A story must have a longitude'],
            },
        },
        category: {
            type: String,
            required: [true, 'A story must have a category'],
            enum: {
                values: ['Historic', 'Anecdotal', 'HiddenGem', 'Memorable'],
                message: 'Category must be one of: Historic, Anecdotal, HiddenGem, Memorable',
            },
        },
        title: {
            type: String,
            required: [true, 'A story must have a title'],
        },
        thumbnailUrl: {
            type: String,
            default: null,
        },
        venue: {
            road: {
                main: {
                    type: String,
                    default: null,
                },
                en: {
                    type: String,
                    default: null,
                },
            },
            suburb: {
                main: {
                    type: String,
                    default: null,
                },
                en: {
                    type: String,
                    default: null,
                },
            },
            district: {
                main: {
                    type: String,
                    default: null,
                },
                en: {
                    type: String,
                    default: null,
                },
            },
        },
        content: {
            type: String,
            required: [true, 'A story must have a content'],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A story must have an author'],
        },
        likeCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

type StoryType = InferSchemaType<typeof storySchema>;
type StoryDoc = HydratedDocument<StoryType>;
interface StoryMethods {
    //
}
type StoryModelType = mongoose.Model<StoryType, {}, StoryMethods>;

storySchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    this.populate({
        path: 'author',
        select: '-__v',
    });
});

const StoryModel = mongoose.model<StoryType, StoryModelType>('Story', storySchema);

export { StoryModel, StoryDoc };
