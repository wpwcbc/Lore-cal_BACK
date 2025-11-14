"use strict";
// src/types/problem.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProblemError = void 0;
class ProblemError extends Error {
    problem;
    constructor(problem, cause) {
        super(problem.detail ?? problem.title);
        this.name = 'ProblemError';
        this.problem = problem;
        if (cause !== undefined) {
            this.cause = cause;
        }
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace?.(this, this.constructor);
    }
}
exports.ProblemError = ProblemError;
