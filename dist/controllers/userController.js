"use strict";
// userController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.getUserById = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const getUserById = async (req, res) => {
    const user = await userModel_1.default.findById(req.params.userId);
    res.status(200).json({
        status: 'success',
        data: {
            user: user,
        },
    });
};
exports.getUserById = getUserById;
const getMe = async (protectedReq, res) => {
    const me = await userModel_1.default.findById(protectedReq.user._id);
    res.status(200).json({
        status: 'success',
        data: {
            me: me,
        },
    });
};
exports.getMe = getMe;
