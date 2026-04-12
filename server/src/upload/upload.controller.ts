import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { memoryStorage } from 'multer';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  private readonly cloudinaryReady: boolean;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    this.cloudinaryReady = Boolean(cloudName && apiKey && apiSecret);

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  @Post('image')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Seuls les fichiers image sont acceptés'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!this.cloudinaryReady) {
      throw new ServiceUnavailableException(
        'Configuration Cloudinary manquante sur le serveur (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)',
      );
    }

    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    let result: { secure_url: string };
    try {
      result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'marche-du-niger', resource_type: 'image' },
          (error, uploadResult) => {
            if (error || !uploadResult) {
              return reject(error ?? new Error('Cloudinary upload failed'));
            }
            resolve(uploadResult as { secure_url: string });
          },
        );
        stream.end(file.buffer);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur Cloudinary inconnue';
      throw new BadRequestException(`Echec upload Cloudinary: ${message}`);
    }

    return { url: result.secure_url };
  }
}
