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
let UploadController = class UploadController {
    constructor(configService) {
        this.configService = configService;
        cloudinary_1.v2.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }
    async uploadImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier fourni');
        }
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary_1.v2.uploader.upload_stream({ folder: 'marche-du-niger', resource_type: 'image' }, (error, result) => {
                if (error || !result)
                    return reject(error ?? new Error('Cloudinary upload failed'));
                resolve(result);
            });
            stream.end(file.buffer);
        });
        return { url: result.secure_url };
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
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new common_1.BadRequestException('Seuls les fichiers image sont acceptés'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImage", null);
exports.UploadController = UploadController = __decorate([
    (0, swagger_1.ApiTags)('upload'),
    (0, common_1.Controller)('upload'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map