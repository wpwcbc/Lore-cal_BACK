import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';
import { StoryModel } from './models/storyModel';

let server: import('http').Server | undefined;

process.on('unhandledRejection', (reason) => {
    console.error('[fatal] unhandledRejection:', reason);
    shutdown(1);
});

process.on('uncaughtException', (err) => {
    console.error('[fatal] uncaughtException:', err);
    shutdown(1);
});

dotenv.config();

const PORT = Number(process.env.PORT)!;
const MONGODB_URI = process.env.MONGODB_URI!.replace('<PASSWORD>', process.env.DB_PASSWORD!);
const DB_NAME = process.env.DB_NAME!;

// Log the environment variables
console.log('[env] MONGODB_URI:', MONGODB_URI);
console.log('[env] DB_NAME:', DB_NAME);
console.log('[env] PORT:', PORT);

// connect to MongoDB

async function start() {
    // 1) CONNECT FIRST
    try {
        await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    } catch (err) {
        console.error('[db] initial connect failed:', err);
        return shutdown(1);
    }
    console.log('[db] connected to MongoDB Atlas');

    // 2) NOW IT'S SAFE TO READ CONNECTION INFO
    const info = {
        host: mongoose.connection.host,
        db: mongoose.connection.name,
        coll: StoryModel.collection.collectionName,
        count: await StoryModel.estimatedDocumentCount(),
    };
    console.log('[db] where am I writing?', info);

    // 3) ONLY AFTER DB IS READY, START HTTP SERVER
    server = app.listen(PORT, () => {
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
        if (server) await new Promise((res) => server!.close(res));
        await mongoose.connection.close(false);
    } finally {
        clearTimeout(force);
        process.exit(code);
    }
}

['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(0)));

start();
