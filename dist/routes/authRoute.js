"use strict";
// authRoute.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
// Contollers
const authController_1 = require("../controllers/authController");
const authRouter = express_1.default.Router();
exports.authRouter = authRouter;
authRouter //
    .get('/is-logged', authController_1.getUser, authController_1.isLogged);
authRouter //
    .post('/signup', authController_1.signup);
authRouter //
    .post('/login', authController_1.login);
authRouter //
    .post('/forgot-password', authController_1.forgotPassword);
authRouter //
    .patch('/reset-password/:token', authController_1.resetPassword);
authRouter //
    .patch('/update-password', authController_1.protect, authController_1.updatePassword);
