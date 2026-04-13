import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { memoryStorage } from 'multer';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_FILES = 8;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const imageFileFilter = (_req: unknown, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    return cb(
      new BadRequestException('Format image non supporte. Utilisez jpg, jpeg, png ou webp.'),
      false,
    );
  }
  cb(null, true);
};

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  private readonly cloudinaryReady: boolean;

  private extractCloudinaryErrorMessage(error: unknown): string {
    if (!error) return 'Erreur Cloudinary inconnue';
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;

    if (typeof error === 'object') {
      const record = error as Record<string, unknown>;
      if (typeof record.message === 'string' && record.message.trim().length > 0) {
        return record.message;
      }
      if (typeof record.error === 'string' && record.error.trim().length > 0) {
        return record.error;
      }
      if (
        typeof record.error === 'object' &&
        record.error !== null &&
        typeof (record.error as Record<string, unknown>).message === 'string'
      ) {
        return (record.error as Record<string, string>).message;
      }

      try {
        return JSON.stringify(record);
      } catch {
        return 'Erreur Cloudinary inconnue';
      }
    }

    return String(error);
  }

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    this.cloudinaryReady = Boolean(cloudName && apiKey && apiSecret);

    cloudinary.config({
      cloud_name: 'dbpxhx7k7',
      api_key: '852441427929288',
      api_secret: '-sTLISbLloK7tGasWCGU-UL2rwM',
    });
  }

  @Post('image')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: imageFileFilter,
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

    return { url: await this.uploadToCloudinary(file) };
  }

  @Post('images')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES, {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: imageFileFilter,
    }),
  )
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ urls: string[] }> {
    if (!this.cloudinaryReady) {
      throw new ServiceUnavailableException(
        'Configuration Cloudinary manquante sur le serveur (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)',
      );
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const urls = await Promise.all(files.map((file) => this.uploadToCloudinary(file)));
    return { urls };
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
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
      const message = this.extractCloudinaryErrorMessage(error);
      throw new BadRequestException(`Echec upload Cloudinary: ${message}`);
    }

    return result.secure_url;
  }
}
