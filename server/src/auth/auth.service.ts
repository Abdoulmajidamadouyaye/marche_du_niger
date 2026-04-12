import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CustomerForgotPasswordDto } from './dto/customer-forgot-password.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerResetPasswordDto } from './dto/customer-reset-password.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';
import {
  AdminAuthPayload,
  CustomerAuthPayload,
  CustomerEntity,
} from '../shared/types/domain.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  loginAdmin(dto: AdminLoginDto): { accessToken: string; admin: { email: string; role: 'admin' } } {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) {
      throw new UnauthorizedException('Configuration administrateur incomplète');
    }

    if (dto.email !== adminEmail || dto.password !== adminPassword) {
      throw new UnauthorizedException('Identifiants administrateur invalides');
    }

    const payload: AdminAuthPayload = {
      sub: 'admin-1',
      email: adminEmail,
      role: 'admin',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      admin: {
        email: adminEmail,
        role: 'admin',
      },
    };
  }

  async registerCustomer(
    dto: CustomerRegisterDto,
  ): Promise<{ accessToken: string; customer: CustomerEntity }> {
    const normalizedPhone = dto.phone.replace(/\s+/g, '').trim();
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existingCustomer = await this.prisma.customer.findFirst({
      where: {
        OR: [{ phone: normalizedPhone }, { email: normalizedEmail }],
      },
    });

    if (existingCustomer) {
      throw new ConflictException('Un compte existe deja avec cet email ou ce numero');
    }

    const passwordHash = this.hashPassword(dto.password);

    const customer = await this.prisma.customer.create({
      data: {
        id: randomUUID(),
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: normalizedPhone,
        email: normalizedEmail,
        passwordHash,
      },
    });

    const entity = this.toCustomerEntity(customer);

    return {
      accessToken: this.jwtService.sign(this.toCustomerPayload(entity)),
      customer: entity,
    };
  }

  async loginCustomer(
    dto: CustomerLoginDto,
  ): Promise<{ accessToken: string; customer: CustomerEntity }> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const customer = await this.prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });

    if (!customer || !customer.passwordHash || !customer.email) {
      throw new UnauthorizedException('Aucun compte trouve avec cet email');
    }

    if (!this.verifyPassword(dto.password, customer.passwordHash)) {
      throw new UnauthorizedException('Les informations client sont invalides');
    }

    const entity = this.toCustomerEntity(customer);

    return {
      accessToken: this.jwtService.sign(this.toCustomerPayload(entity)),
      customer: entity,
    };
  }

  async getCustomersCount(): Promise<{ count: number }> {
    const count = await this.prisma.customer.count();
    return { count };
  }

  async requestCustomerPasswordReset(
    dto: CustomerForgotPasswordDto,
  ): Promise<{ message: string; resetToken?: string; resetUrl?: string }> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const customer = await this.prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });

    // Keep response generic to avoid revealing whether an account exists.
    if (!customer || !customer.email) {
      return {
        message:
          'Si ce compte existe, un lien de reinitialisation a ete genere.',
      };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenHash = this.hashResetToken(resetToken);
    const resetPasswordExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        resetPasswordTokenHash: resetTokenHash,
        resetPasswordExpiresAt,
      },
    });

    const clientUrl = this.configService.get<string>('CLIENT_URL', 'http://localhost:3000');
    const resetUrl = `${clientUrl}/login?mode=reset&email=${encodeURIComponent(normalizedEmail)}&token=${encodeURIComponent(resetToken)}`;

    // TODO: branch an email provider here (Resend/Brevo) for production delivery.
    return {
      message:
        'Lien de reinitialisation genere. Utilisez le token ou le lien pour choisir un nouveau mot de passe.',
      resetToken,
      resetUrl,
    };
  }

  async resetCustomerPassword(dto: CustomerResetPasswordDto): Promise<{ message: string }> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const token = dto.token.trim();

    const customer = await this.prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });

    if (!customer || !customer.resetPasswordTokenHash || !customer.resetPasswordExpiresAt) {
      throw new BadRequestException('Token de reinitialisation invalide ou expire');
    }

    if (customer.resetPasswordExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Token de reinitialisation invalide ou expire');
    }

    const tokenHash = this.hashResetToken(token);
    if (tokenHash !== customer.resetPasswordTokenHash) {
      throw new BadRequestException('Token de reinitialisation invalide ou expire');
    }

    const passwordHash = this.hashPassword(dto.newPassword);

    await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        passwordHash,
        resetPasswordTokenHash: null,
        resetPasswordExpiresAt: null,
      },
    });

    return { message: 'Mot de passe reinitialise avec succes' };
  }

  verifyAdminToken(token: string): AdminAuthPayload {
    const payload = this.jwtService.verify<AdminAuthPayload | CustomerAuthPayload>(token);
    if (payload.role !== 'admin') {
      throw new UnauthorizedException('Token administrateur invalide');
    }
    return payload as AdminAuthPayload;
  }

  verifyCustomerToken(token: string): CustomerAuthPayload {
    const payload = this.jwtService.verify<AdminAuthPayload | CustomerAuthPayload>(token);
    if (payload.role !== 'customer') {
      throw new UnauthorizedException('Token client invalide');
    }
    return payload as CustomerAuthPayload;
  }

  private toCustomerPayload(customer: CustomerEntity): CustomerAuthPayload {
    return {
      sub: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email,
      role: 'customer',
    };
  }

  private toCustomerEntity(customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    passwordHash: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): CustomerEntity {
    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email ?? '',
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}.${hash}`;
  }

  private verifyPassword(password: string, encoded: string): boolean {
    const [salt, storedHash] = encoded.split('.');
    if (!salt || !storedHash) return false;

    const incomingHash = scryptSync(password, salt, 64);
    const storedHashBuffer = Buffer.from(storedHash, 'hex');

    if (incomingHash.length !== storedHashBuffer.length) return false;

    return timingSafeEqual(incomingHash, storedHashBuffer);
  }

  private hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
