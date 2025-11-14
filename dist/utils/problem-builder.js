"use strict";
// src/utils/problem-builder.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeProblem = makeProblem;
const DEFAULT_TITLES = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Content',
    500: 'Internal Server Error',
};
function makeProblem(init) {
    return {
        type: init.type ?? 'about:blank', // WHY: RFC-allowed fallback when no type URI yet.
        title: init.title ?? DEFAULT_TITLES[init.status] ?? 'Error', // WHY: sensible default.
        status: init.status,
        detail: init.detail,
        instance: init.instance,
        ...(init.ext ?? {}), // WHY: simple way to add extensions (e.g., validation errors).
    };
}
