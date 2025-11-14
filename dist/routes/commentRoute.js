"use strict";
// commentRoute.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRouter = exports.commentSubRouter = void 0;
// Dependencies
const express_1 = __importDefault(require("express"));
// Controllers
const authController_1 = require("../controllers/authController");
const commentController_1 = require("../controllers/commentController");
const commentLikeRoute_1 = require("./commentLikeRoute");
////////////////////////////////////
// #region sub-router (under story)
const commentSubRouter = express_1.default.Router({ mergeParams: true });
exports.commentSubRouter = commentSubRouter;
commentSubRouter //
    .route('/')
    .post(authController_1.protect, commentController_1.createComment);
// Comment-chain
commentSubRouter //
    .route('/chains')
    .get(commentController_1.getCommentChainsOfStory);
// #endregion
/////////////
//////////////////
// #region router
const commentRouter = express_1.default.Router();
exports.commentRouter = commentRouter;
// Comment like
commentRouter //
    .use('/:commentId/likes', commentLikeRoute_1.commentLikeRouter);
