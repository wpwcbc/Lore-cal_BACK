// authController.ts

// Dependencies / Types
import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt, { type Secret, type SignOptions, type JwtPayload } from 'jsonwebtoken';
import { sendEmail } from '../utils/email';
import { type SendMailOptions } from 'nodemailer';
import crypto from 'crypto';

// Models
import UserModel, { UserDoc, UserType } from '../models/userModel';
import { ProblemError } from '../types/problem';
import { makeProblem } from '../utils/problem-builder';
import { ObjectId } from 'mongodb';

// Helper
const signToken = (id: ObjectId): string => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET! as Secret, {
        expiresIn: process.env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    });
};

// Controllers
const signup = async (req: Request, res: Response) => {
    const user = await UserModel.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    const token: string = signToken(user._id);

    res.status(201).json({
        status: 'success',

        data: {
            token: token,
            user,
        },
    });
};

const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.error('Please provide email and password.');
        throw new ProblemError(
            makeProblem({
                status: 400,
                type: 'https://lore-cal/problems/invalid-login', // otherwise use a URI you control
                title: 'Invalid Login',
                detail: `Please provide email and password for logging in.`,
            }),
        );
    }

    // Check if the password is correct
    const user = await UserModel.findOne({ email: email }).select('+password');

    const isCorrectPassword: boolean | undefined = await user?.isCorrectPassword(
        password,
        user.password,
    );

    if (!user || !isCorrectPassword) {
        console.error('Email or password not exist.');
        throw new ProblemError(
            makeProblem({
                status: 401,
                type: 'https://lore-cal/problems/login-failed', // otherwise use a URI you control
                title: 'Login Failed',
                detail: `Email or password not exist.`,
            }),
        );
    }

    const token: string = signToken(user._id);

    res.status(200).json({
        status: 'success',
        data: { token },
    });
};

const forgotPassword = async (req: Request, res: Response) => {
    // 1) Get user based on POSTed email
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
        throw new ProblemError(
            makeProblem({
                status: 404,
                type: 'https://lore-cal/problems/email-not-exist', // otherwise use a URI you control
                title: 'Provided Email not Exist',
                detail: `Provided email not exist.`,
            }),
        );
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateModifiedOnly: true });

    // 3) Send it to the user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

    const text: string = `Forgotting Password: Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n
                        If you did not forgot your password, please ignore this message.`;

    const mailOpts: SendMailOptions = {
        to: user.email,
        subject: 'Your password reset token (valid for 10 mins)',
        text: text,
    };

    try {
        await sendEmail(mailOpts);

        res.status(200).json({
            status: 'success',
            messgae: `Token sent to ${user.email}.`,
        });
    } catch (err) {
        user.set('passwordResetToken', undefined);
        user.set('passwordResetExpires', undefined);

        await user.save({ validateModifiedOnly: true });

        throw err;
    }
};

const resetPassword = async (req: Request, res: Response): Promise<void> => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await UserModel.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        throw new ProblemError(
            makeProblem({
                status: 400,
                type: 'https://lore-cal/problems/reset-password-token-expired', // otherwise use a URI you control
                title: 'Reset Password Token Expired',
                detail: `Please request for reset again and complete the procedure within 10 minutes.`,
            }),
        );
    }

    user.set('password', req.body.password);
    user.set('passwordConfirm', req.body.passwordConfirm);
    user.set('passwordResetToken', undefined);
    user.set('passwordResetExpires', undefined);

    await user.save({ validateModifiedOnly: true });

    // 3) Update chanagedPasswordAt property for the user

    // 4) Log the user in, send JWT
    const token: string = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token: token,
    });
};

const updatePassword = async (req: Request, res: Response): Promise<void> => {
    // 1) Get user from the collection
    const user = await UserModel.findById((req as any).user.id).select('+password');

    // 2) Check if the POSTed current password is correct
    const isCorrectPassword: boolean | undefined = await user?.isCorrectPassword(
        req.body.password,
        user.password,
    );

    if (!user || !isCorrectPassword) {
        console.error('Email or password not exist.');
        throw new ProblemError(
            makeProblem({
                status: 401,
                type: 'https://lore-cal/problems/login-failed', // otherwise use a URI you control
                title: 'Login Failed',
                detail: `Email or password not exist.`,
            }),
        );
    }

    // 3) Update the password
    user.set('password', req.body.newPassword);
    user.set('passwordConfirm', req.body.newPasswordConfirm);

    await user.save({ validateModifiedOnly: true });

    // 4) Log the user in
    const token: string = signToken(user._id);

    res.status(201).json({
        status: 'success',
        token: token,
        data: { user },
    });
};

// This controller will called after getUser middleware, so req may has or has not "user"
const isLogged = async (req: Request, res: Response) => {
    let isLogged: boolean | null = null;
    let message: string | null = null;

    if (!(req as any).user) {
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

// Middleware
const protect = async (req: Request, res: Response, next: NextFunction) => {
    // 1) Check if token exist
    const auth: string | undefined = req.get('authorization');
    let token: string | undefined;
    if (auth?.startsWith('Bearer ')) {
        token = auth.split(' ')[1];
    }

    if (!token) {
        throw new ProblemError(
            makeProblem({
                status: 401,
                type: 'https://lore-cal/problems/no-token', // otherwise use a URI you control
                title: 'No Token',
                detail: `Request header did not provide bearer token.`,
            }),
        );
    }

    // 2) Verification token
    const decoded: JwtPayload = (await new Promise<JwtPayload | string>((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET as Secret, (err, payload) =>
            err ? reject(err) : resolve(payload!),
        );
    })) as JwtPayload;

    // 3) Check if user still exist
    const user = await UserModel.findById(decoded.id);

    // 4) Check if user changed password after token is issued
    if (user?.isChangedPasswordAfter(decoded.iat!)) {
        throw new ProblemError(
            makeProblem({
                status: 401,
                type: 'https://lore-cal/problems/token-expired-as-password-recently-changed', // otherwise use a URI you control
                title: 'Token Expired as Password Recently Changed',
                detail: `Please login again after changing password.`,
            }),
        );
    }

    // 5) Granted access if nothing errored
    (req as any).user = user;
    next();
};

const getUser = async (req: Request, res: Response, next: NextFunction) => {
    // 1) Check if token exist
    const auth: string | undefined = req.get('authorization');
    let token: string | undefined;
    if (auth?.startsWith('Bearer ')) {
        token = auth.split(' ')[1];
    }

    if (!token) {
        return next();
    }

    // 2) Verification token
    try {
        const decoded: JwtPayload = (await new Promise<JwtPayload | string>((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET as Secret, (err, payload) =>
                err ? reject(err) : resolve(payload!),
            );
        })) as JwtPayload;

        // 3) Check if user still exist
        const user = await UserModel.findById(decoded.id);

        // 4) Check if user changed password after token is issued
        if (user?.isChangedPasswordAfter(decoded.iat!)) {
            return next();
        }

        // 5) Granted access if nothing errored
        (req as any).user = user;
    } catch {
        // not throwing
    }

    next();
};

const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes((req as any).user.role)) {
            throw new ProblemError(
                makeProblem({
                    status: 403,
                    type: 'https://lore-cal/problems/non-authorized-action', // otherwise use a URI you control
                    title: 'Non-authorized Action',
                    detail: `Your role is not permmited for your requested action.`,
                }),
            );
        }

        next();
    };
};

export {
    signup,
    login,
    forgotPassword,
    resetPassword,
    updatePassword,
    isLogged,
    protect,
    getUser,
    restrictTo,
};
