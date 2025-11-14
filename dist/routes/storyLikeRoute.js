"use strict";
// storyLikeRoute.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storyLikeRouter = void 0;
// Dependencies
const express_1 = __importDefault(require("express"));
// Controllers
const authController_1 = require("../controllers/authController");
const storyLikeController_1 = require("../controllers/storyLikeController");
const storyLikeRouter = express_1.default.Router({ mergeParams: true });
exports.storyLikeRouter = storyLikeRouter;
storyLikeRouter //
    .route('/')
    .get(storyLikeController_1.getLikedStoryUsers)
    .post(authController_1.protect, storyLikeController_1.likeStory)
    .delete(authController_1.protect, storyLikeController_1.unlikeStory);
