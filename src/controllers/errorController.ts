// errorController.ts

// Libraries
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ProblemDetails, ProblemError } from '../types/problem';
import { makeProblem } from '../utils/problem-builder';
import { thirdPartiesToProblem } from '../utils/thirdPartiesToProblem';

const globalErrorHandler: ErrorRequestHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const isProblem: boolean = err instanceof ProblemError;

    const problem: ProblemDetails = isProblem
        ? makeProblem({
              ...err.problem,
              instance: err.problem.instance ?? req.originalUrl,
          })
        : (thirdPartiesToProblem(err, req.originalUrl) ??
          makeProblem({
              status: (err as any).statusCode || 500,
              detail: err?.message ?? 'Unexpected error',
              instance: req.originalUrl,
          }));

    // Development-only debugging info (extension member).
    if (process.env.NODE_ENV === 'development') {
        (problem as any).debug = {
            err: err,
            stack: err.stack,
            cause: (err as any).cause,
            // You can add a traceId/correlationId here if you have one
        };
    }

    res.status(problem.status).type('application/problem+json').json(problem);
};

export { globalErrorHandler };
