// healthController.ts

import { Request, Response } from 'express';

const getHealth = (req: Request, res: Response): void => {
    res.status(200).json({
        status: 'success',
        data: {
            message: 'The server is running.',
            uptime: process.uptime(), // seconds
            timestamp: new Date().toISOString(),
        },
    });
};

export { getHealth };
