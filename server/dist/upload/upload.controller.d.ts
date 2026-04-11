import { ConfigService } from '@nestjs/config';
export declare class UploadController {
    private readonly configService;
    constructor(configService: ConfigService);
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
