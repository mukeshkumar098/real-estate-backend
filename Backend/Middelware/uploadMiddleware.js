import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const mkdirAsync = promisify(fs.mkdir);

// Create temp-uploads directory if it doesn't exist
const tempUploadDir = path.join(process.cwd(), 'temp-uploads');
if (!fs.existsSync(tempUploadDir)) {
    await mkdirAsync(tempUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempUploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, GIF) are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

export default upload;