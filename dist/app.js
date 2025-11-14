"use strict";
// src/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
// Routes
const storyRoute_1 = require("./routes/storyRoute");
const imageRoute_1 = __importDefault(require("./routes/imageRoute"));
const authRoute_1 = require("./routes/authRoute");
// My Type
const problem_1 = require("./types/problem");
const problem_builder_1 = require("./utils/problem-builder");
// My Controller
const errorController_1 = require("./controllers/errorController");
const commentRoute_1 = require("./routes/commentRoute");
const authController_1 = require("./controllers/authController");
const userRoute_1 = require("./routes/userRoute");
const geocodingRoute_1 = require("./routes/geocodingRoute");
const app = (0, express_1.default)();
// Middlewares
// Set security HTTP headers
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
// Body parser
app.use(express_1.default.json({ limit: '10kb' }));
const endpoint = '/api/v1';
// Routes
app.use(`${endpoint}/auth`, authRoute_1.authRouter);
app.use(`${endpoint}/users`, authController_1.getUser, userRoute_1.userRouter);
app.use(`${endpoint}/stories`, authController_1.getUser, storyRoute_1.storyRouter);
app.use(`${endpoint}/images`, authController_1.getUser, imageRoute_1.default);
app.use(`${endpoint}/comments`, authController_1.getUser, commentRoute_1.commentRouter);
app.use(`${endpoint}/geocoding`, authController_1.getUser, geocodingRoute_1.geocodingRouter);
// handle unhandled routes
app.use((req, res, next) => {
    const err = new problem_1.ProblemError((0, problem_builder_1.makeProblem)({
        status: 404,
        type: 'https://lore-cal/problems/not-found',
        title: 'Not Found',
        detail: `Can't find ${req.originalUrl} on this server.`,
        instance: req.originalUrl,
    }));
    next(err);
});
// handle errors
app.use(errorController_1.globalErrorHandler);
exports.default = app;
