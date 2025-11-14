// thirdPartiesToProblem.ts

// Libraries
import { ProblemDetails } from '../types/problem';
import { makeProblem } from './problem-builder';

const thirdPartiesToProblem = (err: any, instance: string): ProblemDetails | null => {
    if (err.name === 'CastError') {
        return handleCastError(err, instance);
    }

    if (err.code === 11000) {
        return handleDuplicateField(err, instance);
    }

    if (err.name === 'ValidationError') {
        return handleValidationError(err, instance);
    }

    if (err.name === 'JsonWebTokenError') {
        return handleJsonWebTokenError(err, instance);
    }

    if (err.name === 'TokenExpiredError') {
        return handleTokenExpiredError(err, instance);
    }

    return null;
};

const handleCastError = (err: any, instance: string): ProblemDetails => {
    const message: string = `Parameter "${err.path}" has invalid value "${err.value}".`;

    return makeProblem({
        status: 400,
        type: 'https://your.app/problems/invalid-parameter',
        title: 'Invalid Parameter',
        detail: message,
        instance: instance,
    });
};

const handleDuplicateField = (err: any, instance: string): ProblemDetails => {
    const value: string = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message: string = `Duplicate field value ${value}. Please use another value.`;

    return makeProblem({
        status: 409,
        type: 'https://your.app/problems/duplicate-field-values',
        title: 'Duplicate Field Values',
        detail: message,
        instance: instance,
    });
};

const handleValidationError = (err: any, instance: string): ProblemDetails => {
    return makeProblem({
        status: 422,
        type: 'https://your.app/problems/validation-error',
        title: 'Invalid Input Value',
        detail: err.message,
        instance: instance,
    });
};

const handleJsonWebTokenError = (err: any, instance: string): ProblemDetails => {
    return makeProblem({
        status: 401,
        type: 'https://your.app/problems/invalid-or-malformed-token',
        title: 'Invalid or Malformed Token',
        detail: err.message,
        instance: instance,
    });
};

const handleTokenExpiredError = (err: any, instance: string): ProblemDetails => {
    return makeProblem({
        status: 401,
        type: 'https://your.app/problems/token-expired',
        title: 'Token Expired, Require Re-login',
        detail: err.message,
        instance: instance,
    });
};

export { thirdPartiesToProblem };
