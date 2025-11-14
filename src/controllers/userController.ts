// userController.ts

import { Request, Response } from 'express';
import UserModel from '../models/userModel';

type params_getUser = {
    userId: string;
};
const getUserById = async (req: Request, res: Response): Promise<void> => {
    const user = await UserModel.findById(req.params.userId);
    res.status(200).json({
        status: 'success',
        data: {
            user: user,
        },
    });
};

const getMe = async (protectedReq: Request, res: Response): Promise<void> => {
    const me = await UserModel.findById((protectedReq as any).user._id);
    res.status(200).json({
        status: 'success',
        data: {
            me: me,
        },
    });
};

export { getUserById, getMe };
