"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const storyModel_1 = require("./models/storyModel");
const requireEnv_1 = require("./utils/requireEnv");
let server;
process.on('unhandledRejection', (reason) => {
    console.error('[fatal] unhandledRejection:', reason);
    shutdown(1);
});
process.on('uncaughtException', (err) => {
    console.error('[fatal] uncaughtException:', err);
    shutdown(1);
});
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI_TEMPLATE = (0, requireEnv_1.requireEnv)('MONGODB_URI');
const DB_PASSWORD = (0, requireEnv_1.requireEnv)('DB_PASSWORD');
const MONGODB_URI = MONGODB_URI_TEMPLATE.replace('<PASSWORD>', DB_PASSWORD);
const DB_NAME = (0, requireEnv_1.requireEnv)('DB_NAME');
// Log the environment variables
console.log('[env] DB_NAME:', DB_NAME);
console.log('[env] PORT:', PORT);
// connect to MongoDB
async function start() {
    // 1) CONNECT FIRST
    try {
        await mongoose_1.default.connect(MONGODB_URI, { dbName: DB_NAME });
    }
    catch (err) {
        console.error('[db] initial connect failed:', err);
        return shutdown(1);
    }
    console.log('[db] connected to MongoDB Atlas');
    // 2) NOW IT'S SAFE TO READ CONNECTION INFO
    const info = {
        host: mongoose_1.default.connection.host,
        db: mongoose_1.default.connection.name,
        coll: storyModel_1.StoryModel.collection.collectionName,
        count: await storyModel_1.StoryModel.estimatedDocumentCount(),
    };
    console.log('[db] where am I writing?', info);
    // 3) ONLY AFTER DB IS READY, START HTTP SERVER
    server = app_1.default.listen(PORT, () => {
        console.log(`[api] listening on http://localhost:${PORT}`);
    });
    server.on('error', (err) => {
        console.error('[api] listen error:', err);
        shutdown(1);
    });
}
async function shutdown(code = 0) {
    const force = setTimeout(() => process.exit(code), 8000);
    try {
        if (server)
            await new Promise((res) => server.close(res));
        await mongoose_1.default.connection.close(false);
    }
    finally {
        clearTimeout(force);
        process.exit(code);
    }
}
['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(0)));
start();
