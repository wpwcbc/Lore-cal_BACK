"use strict";
// userModel.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const AVATAR_CHOICES = [
    'https://res.cloudinary.com/dkzg8zako/image/upload/v1760583559/Icon1_tzpiff.png',
    'https://res.cloudinary.com/dkzg8zako/image/upload/v1760583559/Icon2_icgdld.png',
    'https://res.cloudinary.com/dkzg8zako/image/upload/v1760583880/Icon3_tqhe5b.png',
];
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name.'],
    },
    email: {
        type: String,
        required: [true, 'A user must have an email'],
        unique: true,
        lowercase: true,
        validate: [validator_1.default.isEmail],
    },
    avatarUrl: {
        type: String,
        default: () => AVATAR_CHOICES[Math.floor(Math.random() * AVATAR_CHOICES.length)],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    bio: {
        type: String,
        default: '',
    },
    turf: [
        {
            main: {
                type: String,
                default: null,
            },
            en: {
                type: String,
                default: null,
            },
            count: {
                type: Number,
                default: null,
            },
        },
    ],
    favPlace: {
        type: String,
        default: null,
    },
    password: {
        type: String,
        required: [true, 'A user must have a password.'],
        select: false, // So it will not shown in searches.
    },
    passwordConfirm: {
        type: String,
        required: [true, 'A user must have a passwordConfirm.'],
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: 'passwordConfirm not match.',
        },
    },
    passwordChangedAt: {
        type: Date,
        select: false,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
});
// userSchema.path('passwordConfirm').validate(function (this: UserDoc, val: string): boolean {
//     return val === this.password;
// }, 'Passwords do not match.');
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    this.password = await bcryptjs_1.default.hash(this.password, 12);
    this.set('passwordConfirm', undefined);
    this.set('passwordChangedAt', new Date(Date.now() - 1000));
});
userSchema.methods.isCorrectPassword = async function (inputPassword, storedPassword) {
    return await bcryptjs_1.default.compare(inputPassword, storedPassword);
};
userSchema.methods.isChangedPasswordAfter = function (jwtTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
        console.log(changedTimestamp + ' ' + jwtTimestamp);
        return jwtTimestamp < changedTimestamp;
    }
    return false;
};
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    this.set('passwordResetToken', crypto_1.default.createHash('sha256').update(resetToken).digest('hex'));
    this.set('passwordResetExpires', Date.now() + 10 * 60 * 1000);
    return resetToken;
};
const UserModel = mongoose_1.default.model('User', userSchema);
exports.default = UserModel;
