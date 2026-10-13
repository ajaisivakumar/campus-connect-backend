"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../config/env");
const logger_1 = __importDefault(require("../config/logger"));
class StorageService {
    driver = env_1.env.STORAGE_DRIVER;
    uploadDir = path_1.default.resolve(process.cwd(), 'uploads');
    constructor() {
        if (!fs_1.default.existsSync(this.uploadDir)) {
            fs_1.default.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    getFileUrl(filename) {
        return `${env_1.env.API_BASE_URL}/uploads/${filename}`;
    }
    async deleteFile(filename) {
        try {
            const fullPath = path_1.default.join(this.uploadDir, filename);
            if (fs_1.default.existsSync(fullPath)) {
                fs_1.default.unlinkSync(fullPath);
                return true;
            }
            return false;
        }
        catch (err) {
            logger_1.default.error('Failed to delete file %s: %o', filename, err);
            return false;
        }
    }
}
exports.storageService = new StorageService();
exports.default = exports.storageService;
