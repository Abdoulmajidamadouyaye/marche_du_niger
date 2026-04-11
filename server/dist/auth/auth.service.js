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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const node_crypto_1 = require("node:crypto");
const prisma_service_1 = require("../shared/prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, configService, jwtService) {
        this.prisma = prisma;
        this.configService = configService;
        this.jwtService = jwtService;
    }
    loginAdmin(dto) {
        const adminEmail = this.configService.get('ADMIN_EMAIL');
        const adminPassword = this.configService.get('ADMIN_PASSWORD');
        if (!adminEmail || !adminPassword) {
            throw new common_1.UnauthorizedException('Configuration administrateur incomplète');
        }
        if (dto.email !== adminEmail || dto.password !== adminPassword) {
            throw new common_1.UnauthorizedException('Identifiants administrateur invalides');
        }
        const payload = {
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
    async registerCustomer(dto) {
        const normalizedPhone = dto.phone.replace(/\s+/g, '').trim();
        const normalizedEmail = dto.email.trim().toLowerCase();
        const existingCustomer = await this.prisma.customer.findFirst({
            where: {
                OR: [{ phone: normalizedPhone }, { email: normalizedEmail }],
            },
        });
        if (existingCustomer) {
            throw new common_1.ConflictException('Un compte existe deja avec cet email ou ce numero');
        }
        const passwordHash = this.hashPassword(dto.password);
        const customer = await this.prisma.customer.create({
            data: {
                id: (0, node_crypto_1.randomUUID)(),
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
    async loginCustomer(dto) {
        const normalizedEmail = dto.email.trim().toLowerCase();
        const customer = await this.prisma.customer.findUnique({
            where: { email: normalizedEmail },
        });
        if (!customer || !customer.passwordHash || !customer.email) {
            throw new common_1.UnauthorizedException('Aucun compte trouve avec cet email');
        }
        if (!this.verifyPassword(dto.password, customer.passwordHash)) {
            throw new common_1.UnauthorizedException('Les informations client sont invalides');
        }
        const entity = this.toCustomerEntity(customer);
        return {
            accessToken: this.jwtService.sign(this.toCustomerPayload(entity)),
            customer: entity,
        };
    }
    async getCustomersCount() {
        const count = await this.prisma.customer.count();
        return { count };
    }
    verifyAdminToken(token) {
        const payload = this.jwtService.verify(token);
        if (payload.role !== 'admin') {
            throw new common_1.UnauthorizedException('Token administrateur invalide');
        }
        return payload;
    }
    verifyCustomerToken(token) {
        const payload = this.jwtService.verify(token);
        if (payload.role !== 'customer') {
            throw new common_1.UnauthorizedException('Token client invalide');
        }
        return payload;
    }
    toCustomerPayload(customer) {
        return {
            sub: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            email: customer.email,
            role: 'customer',
        };
    }
    toCustomerEntity(customer) {
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
    hashPassword(password) {
        const salt = (0, node_crypto_1.randomBytes)(16).toString('hex');
        const hash = (0, node_crypto_1.scryptSync)(password, salt, 64).toString('hex');
        return `${salt}.${hash}`;
    }
    verifyPassword(password, encoded) {
        const [salt, storedHash] = encoded.split('.');
        if (!salt || !storedHash)
            return false;
        const incomingHash = (0, node_crypto_1.scryptSync)(password, salt, 64);
        const storedHashBuffer = Buffer.from(storedHash, 'hex');
        if (incomingHash.length !== storedHashBuffer.length)
            return false;
        return (0, node_crypto_1.timingSafeEqual)(incomingHash, storedHashBuffer);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map