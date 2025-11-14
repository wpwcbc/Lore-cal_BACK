"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
        type: String,
        default: '/',
    },
    content: {
        type: String,
        required: [true, 'A story must have a content'],
    },
    author: {
        type: String,
        required: [true, 'A story must have an author'],
    },
}, { timestamps: true });
const StoryModel = mongoose_1.default.model('Story', storySchema);
exports.default = StoryModel;
