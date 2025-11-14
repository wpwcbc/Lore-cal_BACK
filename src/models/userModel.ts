// userModel.ts

import mongoose, { InferSchemaType, HydratedDocument } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const AVATAR_CHOICES = [
    'https://res.cloudinary.com/dkzg8zako/image/upload/v1760583559/Icon1_tzpiff.png',
    'https://res.cloudinary.com/dkzg8zako/image/upload/v1760583559/Icon2_icgdld.png',
    'https://res.cloudinary.com/dkzg8zako/image/upload/v1760583880/Icon3_tqhe5b.png',
];

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name.'],
    },
    email: {
        type: String,
        required: [true, 'A user must have an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail],
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
            validator: function (this: UserDoc, val: string): boolean {
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

type UserType = InferSchemaType<typeof userSchema>;
type UserDoc = HydratedDocument<UserType>;
interface UserMethods {
    isCorrectPassword(input: string, stored: string): Promise<boolean>;
    isChangedPasswordAfter(jwtTimestamp: number): Promise<boolean>;
    createPasswordResetToken(): string;
}
type UserModelType = mongoose.Model<UserType, {}, UserMethods>;

// userSchema.path('passwordConfirm').validate(function (this: UserDoc, val: string): boolean {
//     return val === this.password;
// }, 'Passwords do not match.');

userSchema.pre('save', async function (this: UserDoc) {
    if (!this.isModified('password')) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 12);
    this.set('passwordConfirm', undefined);
    this.set('passwordChangedAt', new Date(Date.now() - 1000));
});

userSchema.methods.isCorrectPassword = async function (
    inputPassword: string,
    storedPassword: string,
): Promise<boolean> {
    return await bcrypt.compare(inputPassword, storedPassword);
};

userSchema.methods.isChangedPasswordAfter = function (jwtTimestamp: number): boolean {
    if (this.passwordChangedAt) {
        const changedTimestamp: number = this.passwordChangedAt.getTime() / 1000;
        console.log(changedTimestamp + ' ' + jwtTimestamp);

        return jwtTimestamp < changedTimestamp;
    }

    return false;
};

userSchema.methods.createPasswordResetToken = function (): string {
    const resetToken: string = crypto.randomBytes(32).toString('hex');

    this.set('passwordResetToken', crypto.createHash('sha256').update(resetToken).digest('hex'));

    this.set('passwordResetExpires', Date.now() + 10 * 60 * 1000);

    return resetToken;
};

const UserModel = mongoose.model<UserType, UserModelType>('User', userSchema);

export default UserModel;
export { UserType, UserDoc };
