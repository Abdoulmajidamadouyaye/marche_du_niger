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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth.service");
let CustomerAuthGuard = class CustomerAuthGuard {
    constructor(authService) {
        this.authService = authService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const header = request.headers.authorization;
        if (!header?.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Token client requis');
        }
        const token = header.slice(7);
        try {
            const payload = this.authService.verifyCustomerToken(token);
            request.customer = payload;
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException('Token client invalide ou expiré');
        }
    }
};
exports.CustomerAuthGuard = CustomerAuthGuard;
exports.CustomerAuthGuard = CustomerAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], CustomerAuthGuard);
//# sourceMappingURL=customer-auth.guard.js.map