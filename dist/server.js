"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const storyModel_1 = __importDefault(require("./models/storyModel"));
dotenv_1.default.config();
const PORT = Number(process.env.PORT);
const MONGODB_URI = process.env.MONGODB_URI.replace('<PASSWORD>', process.env.DB_PASSWORD);
const DB_NAME = process.env.DB_NAME;
// Log the environment variables
console.log('[env] MONGODB_URI:', MONGODB_URI);
console.log('[env] DB_NAME:', DB_NAME);
console.log('[env] PORT:', PORT);
// connect to MongoDB
async function start() {
    try {
        // 1) CONNECT FIRST
        await mongoose_1.default.connect(MONGODB_URI, { dbName: DB_NAME });
        console.log('[db] connected to MongoDB Atlas');
        // 2) NOW IT'S SAFE TO READ CONNECTION INFO
        const info = {
            host: mongoose_1.default.connection.host,
            db: mongoose_1.default.connection.name,
            coll: storyModel_1.default.collection.collectionName,
            count: await storyModel_1.default.estimatedDocumentCount(),
        };
        console.log('[db] where am I writing?', info);
        // 3) ONLY AFTER DB IS READY, START HTTP SERVER
        app_1.default.listen(PORT, () => {
            console.log(`[api] listening on http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error('[fatal] failed to start:', err);
        process.exit(1);
    }
}
start();
