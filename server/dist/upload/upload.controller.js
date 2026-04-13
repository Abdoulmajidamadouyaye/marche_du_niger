"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const cloudinary_1 = require("cloudinary");
const config_1 = require("@nestjs/config");
const admin_auth_guard_1 = require("../auth/guards/admin-auth.guard");
const multer_1 = require("multer");
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 8;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const imageFileFilter = (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
        return cb(new common_1.BadRequestException('Format image non supporte. Utilisez jpg, jpeg, png ou webp.'), false);
    }
    cb(null, true);
};
let UploadController = class UploadController {
    extractCloudinaryErrorMessage(error) {
        if (!error)
            return 'Erreur Cloudinary inconnue';
        if (typeof error === 'string')
            return error;
        if (error instanceof Error)
            return error.message;
        if (typeof error === 'object') {
            const record = error;
            if (typeof record.message === 'string' && record.message.trim().length > 0) {
                return record.message;
            }
            if (typeof record.error === 'string' && record.error.trim().length > 0) {
                return record.error;
            }
            if (typeof record.error === 'object' &&
                record.error !== null &&
                typeof record.error.message === 'string') {
                return record.error.message;
            }
            try {
                return JSON.stringify(record);
            }
            catch {
                return 'Erreur Cloudinary inconnue';
            }
        }
        return String(error);
    }
    constructor(configService) {
        this.configService = configService;
        const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');
        this.cloudinaryReady = Boolean(cloudName && apiKey && apiSecret);
        cloudinary_1.v2.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });
    }
    async uploadImage(file) {
        if (!this.cloudinaryReady) {
            throw new common_1.ServiceUnavailableException('Configuration Cloudinary manquante sur le serveur (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)');
        }
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier fourni');
        }
        return { url: await this.uploadToCloudinary(file) };
    }
    async uploadImages(files) {
        if (!this.cloudinaryReady) {
            throw new common_1.ServiceUnavailableException('Configuration Cloudinary manquante sur le serveur (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)');
        }
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('Aucun fichier fourni');
        }
        const urls = await Promise.all(files.map((file) => this.uploadToCloudinary(file)));
        return { urls };
    }
    async uploadToCloudinary(file) {
        let result;
        try {
            result = await new Promise((resolve, reject) => {
                const stream = cloudinary_1.v2.uploader.upload_stream({ folder: 'marche-du-niger', resource_type: 'image' }, (error, uploadResult) => {
                    if (error || !uploadResult) {
                        return reject(error ?? new Error('Cloudinary upload failed'));
                    }
                    resolve(uploadResult);
                });
                stream.end(file.buffer);
            });
        }
        catch (error) {
            const message = this.extractCloudinaryErrorMessage(error);
            throw new common_1.BadRequestException(`Echec upload Cloudinary: ${message}`);
        }
        return result.secure_url;
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('image'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: MAX_FILE_SIZE },
        fileFilter: imageFileFilter,
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)('images'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', MAX_FILES, {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: MAX_FILE_SIZE },
        fileFilter: imageFileFilter,
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImages", null);
exports.UploadController = UploadController = __decorate([
    (0, swagger_1.ApiTags)('upload'),
    (0, common_1.Controller)('upload'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map