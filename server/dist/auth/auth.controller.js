"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const admin_login_dto_1 = require("./dto/admin-login.dto");
const customer_login_dto_1 = require("./dto/customer-login.dto");
const customer_register_dto_1 = require("./dto/customer-register.dto");
const admin_auth_guard_1 = require("./guards/admin-auth.guard");
const customer_auth_guard_1 = require("./guards/customer-auth.guard");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    login(dto) {
        return this.authService.loginAdmin(dto);
    }
    registerCustomer(dto) {
        return this.authService.registerCustomer(dto);
    }
    loginCustomer(dto) {
        return this.authService.loginCustomer(dto);
    }
    me() {
        return {
            authenticated: true,
            role: 'admin',
        };
    }
    customersCount() {
        return this.authService.getCustomersCount();
    }
    customerMe(request) {
        return request.customer;
    }
    adminLogout() {
        return { message: 'Déconnexion réussie' };
    }
    customerLogout() {
        return { message: 'Déconnexion réussie' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('admin/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_login_dto_1.AdminLoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('customer/register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_register_dto_1.CustomerRegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "registerCustomer", null);
__decorate([
    (0, common_1.Post)('customer/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_login_dto_1.CustomerLoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "loginCustomer", null);
__decorate([
    (0, common_1.Get)('admin/me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('admin/customers/count'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "customersCount", null);
__decorate([
    (0, common_1.Get)('customer/me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(customer_auth_guard_1.CustomerAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "customerMe", null);
__decorate([
    (0, common_1.Post)('admin/logout'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "adminLogout", null);
__decorate([
    (0, common_1.Post)('customer/logout'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(customer_auth_guard_1.CustomerAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "customerLogout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map