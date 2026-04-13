import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AdminForgotPasswordDto } from './dto/admin-forgot-password.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { CustomerForgotPasswordDto } from './dto/customer-forgot-password.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerResetPasswordDto } from './dto/customer-reset-password.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';
import { AdminAuthPayload, CustomerAuthPayload, CustomerEntity } from '../shared/types/domain.types';
export declare class AuthService {
    private readonly prisma;
    private readonly configService;
    private readonly jwtService;
    constructor(prisma: PrismaService, configService: ConfigService, jwtService: JwtService);
    loginAdmin(dto: AdminLoginDto): Promise<{
        accessToken: string;
        admin: {
            email: string;
            role: 'admin';
        };
    }>;
    requestAdminPasswordReset(dto: AdminForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetAdminPassword(dto: AdminResetPasswordDto): Promise<{
        message: string;
    }>;
    registerCustomer(dto: CustomerRegisterDto): Promise<{
        accessToken: string;
        customer: CustomerEntity;
    }>;
    loginCustomer(dto: CustomerLoginDto): Promise<{
        accessToken: string;
        customer: CustomerEntity;
    }>;
    getCustomersCount(): Promise<{
        count: number;
    }>;
    requestCustomerPasswordReset(dto: CustomerForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetCustomerPassword(dto: CustomerResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyAdminToken(token: string): AdminAuthPayload;
    verifyCustomerToken(token: string): CustomerAuthPayload;
    private toCustomerPayload;
    private toCustomerEntity;
    private hashPassword;
    private verifyPassword;
    private hashResetToken;
    private generateResetCode;
    private ensureAdminCredential;
}
