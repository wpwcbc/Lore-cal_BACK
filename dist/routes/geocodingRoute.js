"use strict";
// geocodingRoute.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodingRouter = void 0;
const express_1 = __importDefault(require("express"));
const geocodingController_1 = require("../controllers/geocodingController");
// Contollers
const geocodingRouter = express_1.default.Router();
exports.geocodingRouter = geocodingRouter;
geocodingRouter //
    .get('/reverse', geocodingController_1.reverseGeocoding);
