"use strict";
// commentRoute.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
// Dependencies
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authController_1 = require("../controllers/authController");
const storyController_1 = require("../controllers/storyController");
// Controllers
const userRouter = express_1.default.Router();
exports.userRouter = userRouter;
userRouter //
    .route('/me')
    .get(authController_1.protect, userController_1.getMe);
userRouter //
    .route('/:userId')
    .get(userController_1.getUserById);
userRouter //
    .route('/me/stories')
    .get(authController_1.protect, storyController_1.getStoriesByMe);
userRouter //
    .route('/:userId/stories')
    .get(storyController_1.getStoriesByUserId);
