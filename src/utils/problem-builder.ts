// src/utils/problem-builder.ts

import type { ProblemDetails } from '../types/problem';

const DEFAULT_TITLES: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Content',
    500: 'Internal Server Error',
};

export function makeProblem(init: {
    status: number;
    type?: string;
    title?: string;
    detail?: string;
    instance?: string;
    ext?: Record<string, unknown>;
}): ProblemDetails {
    return {
        type: init.type ?? 'about:blank', // WHY: RFC-allowed fallback when no type URI yet.
        title: init.title ?? DEFAULT_TITLES[init.status] ?? 'Error', // WHY: sensible default.
        status: init.status,
        detail: init.detail,
        instance: init.instance,
        ...(init.ext ?? {}), // WHY: simple way to add extensions (e.g., validation errors).
    };
}
