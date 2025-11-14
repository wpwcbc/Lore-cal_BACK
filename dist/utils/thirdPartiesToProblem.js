"use strict";
// thirdPartiesToProblem.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.thirdPartiesToProblem = void 0;
const problem_builder_1 = require("./problem-builder");
const thirdPartiesToProblem = (err, instance) => {
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
exports.thirdPartiesToProblem = thirdPartiesToProblem;
const handleCastError = (err, instance) => {
    const message = `Parameter "${err.path}" has invalid value "${err.value}".`;
    return (0, problem_builder_1.makeProblem)({
        status: 400,
        type: 'https://your.app/problems/invalid-parameter',
        title: 'Invalid Parameter',
        detail: message,
        instance: instance,
    });
};
const handleDuplicateField = (err, instance) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value ${value}. Please use another value.`;
    return (0, problem_builder_1.makeProblem)({
        status: 409,
        type: 'https://your.app/problems/duplicate-field-values',
        title: 'Duplicate Field Values',
        detail: message,
        instance: instance,
    });
};
const handleValidationError = (err, instance) => {
    return (0, problem_builder_1.makeProblem)({
        status: 422,
        type: 'https://your.app/problems/validation-error',
        title: 'Invalid Input Value',
        detail: err.message,
        instance: instance,
    });
};
const handleJsonWebTokenError = (err, instance) => {
    return (0, problem_builder_1.makeProblem)({
        status: 401,
        type: 'https://your.app/problems/invalid-or-malformed-token',
        title: 'Invalid or Malformed Token',
        detail: err.message,
        instance: instance,
    });
};
const handleTokenExpiredError = (err, instance) => {
    return (0, problem_builder_1.makeProblem)({
        status: 401,
        type: 'https://your.app/problems/token-expired',
        title: 'Token Expired, Require Re-login',
        detail: err.message,
        instance: instance,
    });
};
