import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token administrateur requis');
    }

    const token = header.slice(7);

    try {
      const payload = this.authService.verifyAdminToken(token);
      (request as Request & { admin?: unknown }).admin = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }
}
