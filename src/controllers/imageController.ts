// Dependencies / Types
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Print environment variables
console.log('[env] CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('[env] CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('[env] CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET);
console.log('[env] CLOUDINARY_FOLDER:', process.env.CLOUDINARY_FOLDER);

const uploadBufferToCloudinary = async (
    buffer: Buffer,
    folder: string,
): Promise<UploadApiResponse> => {
    return new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                // Optional transformations (auto format/quality)
                transformation: [{ fetch_format: 'auto', quality: 'auto' }],
                // Belt-and-suspenders: Cloudinary can also enforce formats
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            },
            (error, uploadResult) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(uploadResult as UploadApiResponse);
                }
            },
        );
        uploadStream.end(buffer);
    });
};

const uploadImage = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({
            status: 'error',
            message: 'No file uploaded',
        });
    }

    const folder = process.env.CLOUDINARY_FOLDER!;

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

export { uploadImage };
