// Dependencies
import express from 'express';
import multer from 'multer';
// Controllers
import { uploadImage } from '../controllers/imageController';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.route('/').post(upload.single('image'), uploadImage);

export default router;
