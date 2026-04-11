import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';
import { AdminAuthPayload, CustomerAuthPayload, CustomerEntity } from '../shared/types/domain.types';
export declare class AuthService {
    private readonly prisma;
    private readonly configService;
    private readonly jwtService;
    constructor(prisma: PrismaService, configService: ConfigService, jwtService: JwtService);
    loginAdmin(dto: AdminLoginDto): {
        accessToken: string;
        admin: {
            email: string;
            role: 'admin';
        };
    };
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
    verifyAdminToken(token: string): AdminAuthPayload;
    verifyCustomerToken(token: string): CustomerAuthPayload;
    private toCustomerPayload;
    private toCustomerEntity;
    private hashPassword;
    private verifyPassword;
}
