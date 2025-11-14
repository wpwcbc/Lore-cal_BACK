"use strict";
// errorController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const problem_1 = require("../types/problem");
const problem_builder_1 = require("../utils/problem-builder");
const thirdPartiesToProblem_1 = require("../utils/thirdPartiesToProblem");
const globalErrorHandler = (err, req, res, next) => {
    const isProblem = err instanceof problem_1.ProblemError;
    const problem = isProblem
        ? (0, problem_builder_1.makeProblem)({
            ...err.problem,
            instance: err.problem.instance ?? req.originalUrl,
        })
        : ((0, thirdPartiesToProblem_1.thirdPartiesToProblem)(err, req.originalUrl) ??
            (0, problem_builder_1.makeProblem)({
                status: err.statusCode || 500,
                detail: err?.message ?? 'Unexpected error',
                instance: req.originalUrl,
            }));
    // Development-only debugging info (extension member).
    if (process.env.NODE_ENV === 'development') {
        problem.debug = {
            err: err,
            stack: err.stack,
            cause: err.cause,
            // You can add a traceId/correlationId here if you have one
        };
    }
    res.status(problem.status).type('application/problem+json').json(problem);
};
exports.globalErrorHandler = globalErrorHandler;
