"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
// Dependencies / Types
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = require("cloudinary");
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Print environment variables
console.log('[env] CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('[env] CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('[env] CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET);
console.log('[env] CLOUDINARY_FOLDER:', process.env.CLOUDINARY_FOLDER);
const uploadBufferToCloudinary = async (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            resource_type: 'image',
            // Optional transformations (auto format/quality)
            transformation: [{ fetch_format: 'auto', quality: 'auto' }],
            // Belt-and-suspenders: Cloudinary can also enforce formats
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        }, (error, uploadResult) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(uploadResult);
            }
        });
        uploadStream.end(buffer);
    });
};
const uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            status: 'error',
            message: 'No file uploaded',
        });
    }
    const folder = process.env.CLOUDINARY_FOLDER;
    const result = await uploadBufferToCloudinary(req.file.buffer, folder);
    // Success
    res.status(201).json({
        status: 'success',
        data: {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
        },
    });
};
exports.uploadImage = uploadImage;
