"use strict";
// utils/requireEnv.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEnv = void 0;
const requireEnv = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
};
exports.requireEnv = requireEnv;
