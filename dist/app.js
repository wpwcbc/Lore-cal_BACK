"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Routes
const storyRoute_1 = __importDefault(require("./routes/storyRoute"));
const imageRoute_1 = __importDefault(require("./routes/imageRoute"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/v1/stories', storyRoute_1.default);
app.use('/api/v1/images', imageRoute_1.default);
exports.default = app;
