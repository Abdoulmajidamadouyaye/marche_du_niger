import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { CustomerAuthGuard } from './guards/customer-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  login(@Body() dto: AdminLoginDto) {
    return this.authService.loginAdmin(dto);
  }

  @Post('customer/register')
  registerCustomer(@Body() dto: CustomerRegisterDto) {
    return this.authService.registerCustomer(dto);
  }

  @Post('customer/login')
  loginCustomer(@Body() dto: CustomerLoginDto) {
    return this.authService.loginCustomer(dto);
  }

  @Get('admin/me')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  me() {
    return {
      authenticated: true,
      role: 'admin',
    };
  }

  @Get('admin/customers/count')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  customersCount() {
    return this.authService.getCustomersCount();
  }

  @Get('customer/me')
  @ApiBearerAuth()
  @UseGuards(CustomerAuthGuard)
  customerMe(@Req() request: Request & { customer?: unknown }) {
    return request.customer;
  }

  @Post('admin/logout')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  adminLogout() {
    return { message: 'Déconnexion réussie' };
  }

  @Post('customer/logout')
  @ApiBearerAuth()
  @UseGuards(CustomerAuthGuard)
  customerLogout() {
    return { message: 'Déconnexion réussie' };
  }
}
