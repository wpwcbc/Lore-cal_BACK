// // src/types/httpErrors.ts

// class HttpError extends Error {
//     public readonly statusCode: number;
//     public readonly status: 'fail' | 'error';
//     public readonly cause: any;

//     constructor(message: string, statusCode: number, cause?: any) {
//         super(message);

//         this.name = 'HttpError';
//         this.statusCode = statusCode;
//         this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

//         if (cause != undefined) {
//             // TS will accept this if your tsconfig includes ES2022.Error lib
//             this.cause = cause;
//         }

//         // Restore prototype chain for TS/Node
//         Object.setPrototypeOf(this, new.target.prototype);
//         Error.captureStackTrace?.(this, this.constructor);
//     }
// }

// export default HttpError;
