"use strict";
// authController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.getUser = exports.protect = exports.isLogged = exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../utils/email");
const crypto_1 = __importDefault(require("crypto"));
// Models
const userModel_1 = __importDefault(require("../models/userModel"));
const problem_1 = require("../types/problem");
const problem_builder_1 = require("../utils/problem-builder");
// Helper
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
// Controllers
const signup = async (req, res) => {
    const user = await userModel_1.default.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });
    const token = signToken(user._id);
    res.status(201).json({
        status: 'success',
        data: {
            token: token,
            user,
        },
    });
};
exports.signup = signup;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        console.error('Please provide email and password.');
        throw new problem_1.ProblemError((0, problem_builder_1.makeProblem)({
            status: 400,
            type: 'https://lore-cal/problems/invalid-login', // otherwise use a URI you control
            title: 'Invalid Login',
            detail: `Please provide email and password for logging in.`,
        }));
    }
    // Check if the password is correct
    const user = await userModel_1.default.findOne({ email: email }).select('+password');
    const isCorrectPassword = await user?.isCorrectPassword(password, user.password);
    if (!user || !isCorrectPassword) {
        console.error('Email or password not exist.');
        throw new problem_1.ProblemError((0, problem_builder_1.makeProblem)({
            status: 401,
            type: 'https://lore-cal/problems/login-failed', // otherwise use a URI you control
            title: 'Login Failed',
            detail: `Email or password not exist.`,
        }));
    }
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        data: { token },
    });
};
exports.login = login;
const forgotPassword = async (req, res) => {
    // 1) Get user based on POSTed email
    const user = await userModel_1.default.findOne({ email: req.body.email });
    if (!user) {
        throw new problem_1.ProblemError((0, problem_builder_1.makeProblem)({
            status: 404,
            type: 'https://lore-cal/problems/email-not-exist', // otherwise use a URI you control
            title: 'Provided Email not Exist',
            detail: `Provided email not exist.`,
        }));
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateModifiedOnly: true });
    // 3) Send it to the user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
    const text = `Forgotting Password: Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n
                        If you did not forgot your password, please ignore this message.`;
    const mailOpts = {
        to: user.email,
        subject: 'Your password reset token (valid for 10 mins)',
        text: text,
    };
    try {
        await (0, email_1.sendEmail)(mailOpts);
        res.status(200).json({
            status: 'success',
            messgae: `Token sent to ${user.email}.`,
        });
    }
    catch (err) {
        user.set('passwordResetToken', undefined);
        user.set('passwordResetExpires', undefined);
        await user.save({ validateModifiedOnly: true });
        throw err;
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    // 1) Get user based on the token
    const hashedToken = crypto_1.default.createHash('sha256').update(req.params.token).digest('hex');
    const user = await userModel_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        throw new problem_1.ProblemError((0, problem_builder_1.makeProblem)({
            status: 400,
            type: 'https://lore-cal/problems/reset-password-token-expired', // otherwise use a URI you control
            title: 'Reset Password Token Expired',
            detail: `Please request for reset again and complete the procedure within 10 minutes.`,
        }));
    }
    user.set('password', req.body.password);
    user.set('passwordConfirm', req.body.passwordConfirm);
    user.set('passwordResetToken', undefined);
    user.set('passwordResetExpires', undefined);
    await user.save({ validateModifiedOnly: true });
    // 3) Update chanagedPasswordAt property for the user
    // 4) Log the user in, send JWT
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token: token,
    });
};
exports.resetPassword = resetPassword;
const updatePassword = async (req, res) => {
    // 1) Get user from the collection
    const user = await userModel_1.default.findById(req.user.id).select('+password');
    // 2) Check if the POSTed current password is correct
    const isCorrectPassword = await user?.isCorrectPassword(req.body.password, user.password);
    if (!user || !isCorrectPassword) {
        console.error('Email or password not exist.');
        throw new problem_1.ProblemError((0, problem_builder_1.makeProblem)({
            status: 401,
            type: 'https://lore-cal/problems/login-failed', // otherwise use a URI you control
            title: 'Login Failed',
            detail: `Email or password not exist.`,
        }));
    }
    // 3) Update the password
    user.set('password', req.body.newPassword);
    user.set('passwordConfirm', req.body.newPasswordConfirm);
    await user.save({ validateModifiedOnly: true });
    // 4) Log the user in
    const token = signToken(user._id);
    res.status(201).json({
        status: 'success',
        token: token,
        data: { user },
    });
};
exports.updatePassword = updatePassword;
// This controller will called after getUser middleware, so req may has or has not "user"
const isLogged = async (req, res) => {
    let isLogged = null;
    let message = null;
    if (!req.user) {
        isLogged = false;
        message = 'You are not logged. Please login again.';
    }
    return res.status(200).json({
        status: 'success',
        data: {
            isLogged: isLogged ?? true,
            message: message ?? 'You are logged.',
        },
    });
};
exports.isLogged = isLogged;
// Middleware
const protect = async (req, res, next) => {
    // 1) Check if token exist
    const auth = req.get('authorization');
    let token;
    if (auth?.startsWith('Bearer ')) {
        token = auth.split(' ')[1];
    }
    if (!token) {
        throw new problem_1.ProblemError((0, problem_builder_1.makeProblem)({
            status: 401,
            type: 'https://lore-cal/problems/no-token', // otherwise use a URI you control
            title: 'No Token',
            detail: `Request header did not provide bearer token.`,
        }));
    }
    // 2) Verification token
    const decoded = (await new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, payload) => err ? reject(err) : resolve(payload));
    }));
    // 3) Check if user still exist
    const user = await userModel_1.default.findById(decoded.id);
    // 4) Check if user changed password after token is issued
    if (user?.isChangedPasswordAfter(decoded.iat)) {
        throw new problem_1.ProblemError((0, problem_builder_1.makeProblem)({
            status: 401,
            type: 'https://lore-cal/problems/token-expired-as-password-recently-changed', // otherwise use a URI you control
            title: 'Token Expired as Password Recently Changed',
            detail: `Please login again after changing password.`,
        }));
    }
    // 5) Granted access if nothing errored
    req.user = user;
    next();
};
exports.protect = protect;
const getUser = async (req, res, next) => {
    // 1) Check if token exist
    const auth = req.get('authorization');
    let token;
    if (auth?.startsWith('Bearer ')) {
        token = auth.split(' ')[1];
    }
    if (!token) {
        return next();
    }
    // 2) Verification token
    try {
        const decoded = (await new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, payload) => err ? reject(err) : resolve(payload));
        }));
        // 3) Check if user still exist
        const user = await userModel_1.default.findById(decoded.id);
        // 4) Check if user changed password after token is issued
        if (user?.isChangedPasswordAfter(decoded.iat)) {
            return next();
        }
        // 5) Granted access if nothing errored
        req.user = user;
    }
    catch {
        // not throwing
    }
    next();
};
exports.getUser = getUser;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new problem_1.ProblemError((0, problem_builder_1.makeProblem)({
                status: 403,
                type: 'https://lore-cal/problems/non-authorized-action', // otherwise use a URI you control
                title: 'Non-authorized Action',
                detail: `Your role is not permmited for your requested action.`,
            }));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
