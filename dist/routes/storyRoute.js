"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
const express_1 = __importDefault(require("express"));
// Controllers
const storyController_1 = require("../controllers/storyController");
const router = express_1.default.Router();
router //
    .route('/')
    .get(storyController_1.getStories)
    .post(storyController_1.createStory);
router //
    .route('/:id')
    .get(storyController_1.getStoryById)
    .patch(storyController_1.updateStory)
    .delete(storyController_1.deleteStory);
exports.default = router;
