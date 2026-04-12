import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AdminForgotPasswordDto } from './dto/admin-forgot-password.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { CustomerForgotPasswordDto } from './dto/customer-forgot-password.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerResetPasswordDto } from './dto/customer-reset-password.dto';
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

  @Post('admin/forgot-password')
  forgotAdminPassword(@Body() dto: AdminForgotPasswordDto) {
    return this.authService.requestAdminPasswordReset(dto);
  }

  @Post('admin/reset-password')
  resetAdminPassword(@Body() dto: AdminResetPasswordDto) {
    return this.authService.resetAdminPassword(dto);
  }

  @Post('customer/register')
  registerCustomer(@Body() dto: CustomerRegisterDto) {
    return this.authService.registerCustomer(dto);
  }

  @Post('customer/login')
  loginCustomer(@Body() dto: CustomerLoginDto) {
    return this.authService.loginCustomer(dto);
  }

  @Post('customer/forgot-password')
  forgotCustomerPassword(@Body() dto: CustomerForgotPasswordDto) {
    return this.authService.requestCustomerPasswordReset(dto);
  }

  @Post('customer/reset-password')
  resetCustomerPassword(@Body() dto: CustomerResetPasswordDto) {
    return this.authService.resetCustomerPassword(dto);
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
