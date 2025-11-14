"use strict";
// storyRoute.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storyRouter = void 0;
// Dependencies
const express_1 = __importDefault(require("express"));
// Controllers
const storyController_1 = require("../controllers/storyController");
const authController_1 = require("../controllers/authController");
const commentRoute_1 = require("./commentRoute");
const storyLikeRoute_1 = require("./storyLikeRoute");
const storyRouter = express_1.default.Router();
exports.storyRouter = storyRouter;
// Param middleware
// router.param('id', (req: Request, res: Response, next: NextFunction, val: string) => {
//     console.log(`story id: ${val}`);
//     next();
// });
storyRouter //
    .route('/admin-announcement')
    .post(authController_1.protect, (0, authController_1.restrictTo)('admin'), storyController_1.createAdminAnnouncement);
storyRouter //
    .route('/')
    .get(storyController_1.getStories)
    .post(authController_1.protect, storyController_1.createStory);
storyRouter //
    .route('/:storyId')
    .get(storyController_1.getStoryById)
    .patch(storyController_1.updateStory)
    .delete(storyController_1.deleteStory);
// Comment-chain
storyRouter //
    .use('/:storyId/comments', commentRoute_1.commentSubRouter);
// StoryLike
storyRouter //
    .use('/:storyId/likes', storyLikeRoute_1.storyLikeRouter);
