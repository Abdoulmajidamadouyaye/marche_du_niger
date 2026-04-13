import { ConfigService } from '@nestjs/config';
export declare class UploadController {
    private readonly configService;
    private readonly cloudinaryReady;
    private extractCloudinaryErrorMessage;
    constructor(configService: ConfigService);
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadImages(files: Express.Multer.File[]): Promise<{
        urls: string[];
    }>;
    private uploadToCloudinary;
}
