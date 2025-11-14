"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStory = exports.updateStory = exports.createStory = exports.getStoryById = exports.getStories = void 0;
// Models
const storyModel_1 = __importDefault(require("../models/storyModel"));
// #region GET
// Get all
const getStories = async (req, res) => {
    console.log('test');
    try {
        const stories = await storyModel_1.default.find();
        console.log('test');
        res.status(200).json({
            status: 'success',
            results: stories.length,
            data: {
                stories: stories,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
};
exports.getStories = getStories;
// Get one by id
const getStoryById = async (req, res) => {
    try {
        const story = await storyModel_1.default.findById(req.params.id);
        console.log('story', story);
        res.status(200).json({
            status: 'success',
            data: {
                story: story,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
};
exports.getStoryById = getStoryById;
// #endregion
// #region POST
const createStory = async (req, res) => {
    try {
        const story = await storyModel_1.default.create(req.body);
        res.status(201).json({ status: 'success', data: { story } });
    }
    catch (error) {
        const code = error.name === 'ValidationError'
            ? 400
            : error.code === 11000
                ? 409 // duplicate key
                : 500;
        res.status(code).json({
            status: 'error',
            message: error.message,
            details: error.errors ?? undefined,
        });
    }
};
exports.createStory = createStory;
// #endregion
// #region PATCH
// Update one by id
const updateStory = async (req, res) => {
    try {
        const story = await storyModel_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: 'success',
            data: {
                story: story,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
};
exports.updateStory = updateStory;
// #endregion
// #region DELETE
// Delete one by id
const deleteStory = async (req, res) => {
    try {
        await storyModel_1.default.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
};
exports.deleteStory = deleteStory;
