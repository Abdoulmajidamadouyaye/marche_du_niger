import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token client requis');
    }

    const token = header.slice(7);

    try {
      const payload = this.authService.verifyCustomerToken(token);
      (request as Request & { customer?: unknown }).customer = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token client invalide ou expiré');
    }
  }
}