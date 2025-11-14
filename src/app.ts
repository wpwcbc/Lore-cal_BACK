// src/app.ts

import express from 'express';
import cors from 'cors';
import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import helmet from 'helmet';
// Routes
import { storyRouter } from './routes/storyRoute';
import imageRouter from './routes/imageRoute';
import { authRouter } from './routes/authRoute';
// My Type
import { ProblemError } from './types/problem';
import { makeProblem } from './utils/problem-builder';
// My Controller
import { globalErrorHandler } from './controllers/errorController';
import { commentRouter } from './routes/commentRoute';
import { getUser } from './controllers/authController';
import { userRouter } from './routes/userRoute';
import { geocodingRouter } from './routes/geocodingRoute';
import { getHealth } from './controllers/healthController';

const app = express();

// Middlewares

// Set security HTTP headers
app.use(helmet());

app.use(cors());

// Body parser
app.use(express.json({ limit: '10kb' }));

const endpoint: string = '/api/v1';

// Routes
app.use(`${endpoint}/health`, getHealth);
app.use(`${endpoint}/auth`, authRouter);
app.use(`${endpoint}/users`, getUser, userRouter);
app.use(`${endpoint}/stories`, getUser, storyRouter);
app.use(`${endpoint}/images`, getUser, imageRouter);
app.use(`${endpoint}/comments`, getUser, commentRouter);
app.use(`${endpoint}/geocoding`, getUser, geocodingRouter);

// handle unhandled routes
app.use((req: Request, res: Response, next: NextFunction) => {
    const err = new ProblemError(
        makeProblem({
            status: 404,
            type: 'https://lore-cal/problems/not-found',
            title: 'Not Found',
            detail: `Can't find ${req.originalUrl} on this server.`,
            instance: req.originalUrl,
        }),
    );

    next(err);
});

// handle errors
app.use(globalErrorHandler);

export default app;
