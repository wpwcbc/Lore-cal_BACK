"use strict";
// storyModel.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const storySchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A story must have an author'],
    },
    likeCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
storySchema.pre(/^find/, function () {
    this.populate({
        path: 'author',
        select: '-__v',
    });
});
const StoryModel = mongoose_1.default.model('Story', storySchema);
exports.StoryModel = StoryModel;
