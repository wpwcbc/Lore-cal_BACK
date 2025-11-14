// authRoute.ts

import express from 'express';
// Contollers
import {
    signup,
    login,
    forgotPassword,
    resetPassword,
    protect,
    updatePassword,
    isLogged,
    getUser,
} from '../controllers/authController';

const authRouter = express.Router();

authRouter //
    .get('/is-logged', getUser, isLogged);

authRouter //
    .post('/signup', signup);

authRouter //
    .post('/login', login);

authRouter //
    .post('/forgot-password', forgotPassword);

authRouter //
    .patch('/reset-password/:token', resetPassword);

authRouter //
    .patch('/update-password', protect, updatePassword);

export { authRouter };
