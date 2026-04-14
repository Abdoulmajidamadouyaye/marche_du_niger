import { Request } from 'express';
import { AuthService } from './auth.service';
import { AdminForgotPasswordDto } from './dto/admin-forgot-password.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { CustomerForgotPasswordDto } from './dto/customer-forgot-password.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerResetPasswordDto } from './dto/customer-reset-password.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    loginAdmin(dto: AdminLoginDto): Promise<{
        accessToken: string;
        admin: {
            email: string;
            role: "admin";
        };
    }>;
    forgotAdminPassword(dto: AdminForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetAdminPassword(dto: AdminResetPasswordDto): Promise<{
        message: string;
    }>;
    registerCustomer(dto: CustomerRegisterDto): Promise<{
        accessToken: string;
        customer: import("../shared/types/domain.types").CustomerEntity;
    }>;
    loginCustomer(dto: CustomerLoginDto): Promise<{
        accessToken: string;
        customer: import("../shared/types/domain.types").CustomerEntity;
    }>;
    forgotCustomerPassword(dto: CustomerForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetCustomerPassword(dto: CustomerResetPasswordDto): Promise<{
        message: string;
    }>;
    me(): {
        authenticated: boolean;
        role: string;
    };
    customersCount(): Promise<{
        count: number;
    }>;
    customerMe(request: Request & {
        customer?: unknown;
    }): unknown;
    adminLogout(): {
        message: string;
    };
    customerLogout(): {
        message: string;
    };
}
