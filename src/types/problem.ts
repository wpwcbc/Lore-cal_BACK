// src/types/problem.ts

export interface ProblemDetails {
    /** A URI identifying the problem type. Use a doc URL or 'about:blank'. */
    type: string;

    /** Short, human-readable title for that type (stable per type). */
    title: string;

    /** The HTTP status code for this occurrence. */
    status: number;

    /** Human-readable details about this occurrence. */
    detail?: string;

    /** A URI reference to the specific occurrence (often req.originalUrl). */
    instance?: string;

    /** RFC allows arbitrary extension members. */
    [ext: string]: unknown;
}

export class ProblemError extends Error {
    public readonly problem: ProblemDetails;

    constructor(problem: ProblemDetails, cause?: unknown) {
        super(problem.detail ?? problem.title);

        this.name = 'ProblemError';
        this.problem = problem;

        if (cause !== undefined) {
            (this as any).cause = cause;
        }

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace?.(this, this.constructor);
    }
}
