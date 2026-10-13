"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMagicBytes = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const uploadDirectory = path_1.default.resolve(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadDirectory)) {
    fs_1.default.mkdirSync(uploadDirectory, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const uniqueName = `${(0, uuid_1.v4)()}${ext}`;
        cb(null, uniqueName);
    },
});
const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
];
const fileFilter = (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file format. Only JPEG, PNG, WEBP, and PDF files are allowed.'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max
    },
    fileFilter,
});
// Magic bytes validation middleware
const validateMagicBytes = async (req, res, next) => {
    if (!req.file) {
        next();
        return;
    }
    const filePath = req.file.path;
    try {
        const buffer = Buffer.alloc(8);
        const fd = fs_1.default.openSync(filePath, 'r');
        fs_1.default.readSync(fd, buffer, 0, 8, 0);
        fs_1.default.closeSync(fd);
        const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
        const isPng = buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4e &&
            buffer[3] === 0x47;
        const isPdf = buffer[0] === 0x25 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x44 &&
            buffer[3] === 0x46; // %PDF
        const isWebp = buffer[0] === 0x52 &&
            buffer[1] === 0x49 &&
            buffer[2] === 0x46 &&
            buffer[3] === 0x46; // RIFF (WebP)
        if (!isJpeg && !isPng && !isPdf && !isWebp) {
            fs_1.default.unlinkSync(filePath); // delete invalid file
            res.status(400).json({
                success: false,
                message: 'File content does not match allowed magic byte signatures.',
            });
            return;
        }
        next();
    }
    catch (err) {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        res.status(500).json({
            success: false,
            message: 'Failed to verify file integrity.',
        });
    }
};
exports.validateMagicBytes = validateMagicBytes;
