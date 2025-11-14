"use strict";
// commentLikeRoute.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentLikeRouter = void 0;
// Dependencies
const express_1 = __importDefault(require("express"));
// Controllers
const authController_1 = require("../controllers/authController");
const commentLikeController_1 = require("../controllers/commentLikeController");
const commentLikeRouter = express_1.default.Router({ mergeParams: true });
exports.commentLikeRouter = commentLikeRouter;
commentLikeRouter //
    .route('/')
    .get(commentLikeController_1.getLikedCommentUsers)
    .post(authController_1.protect, commentLikeController_1.likeComment)
    .delete(authController_1.protect, commentLikeController_1.unlikeComment);
