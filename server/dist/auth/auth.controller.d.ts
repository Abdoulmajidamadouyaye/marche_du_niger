import { Request } from 'express';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: AdminLoginDto): {
        accessToken: string;
        admin: {
            email: string;
            role: "admin";
        };
    };
    registerCustomer(dto: CustomerRegisterDto): Promise<{
        accessToken: string;
        customer: import("../shared/types/domain.types").CustomerEntity;
    }>;
    loginCustomer(dto: CustomerLoginDto): Promise<{
        accessToken: string;
        customer: import("../shared/types/domain.types").CustomerEntity;
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
