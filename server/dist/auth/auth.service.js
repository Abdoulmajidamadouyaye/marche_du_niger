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
const nodemailer_1 = require("nodemailer");
const prisma_service_1 = require("../shared/prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, configService, jwtService) {
        this.prisma = prisma;
        this.configService = configService;
        this.jwtService = jwtService;
    }
    async loginAdmin(dto) {
        const adminEmail = this.configService.get('ADMIN_EMAIL');
        const adminPassword = this.configService.get('ADMIN_PASSWORD');
        if (!adminEmail || !adminPassword) {
            throw new common_1.UnauthorizedException('Configuration administrateur incomplète');
        }
        const adminCredential = await this.ensureAdminCredential(adminEmail, adminPassword);
        const normalizedEmail = dto.email.trim().toLowerCase();
        if (normalizedEmail !== adminCredential.email) {
            throw new common_1.UnauthorizedException('Identifiants invalides ou incorrects');
        }
        if (!this.verifyPassword(dto.password, adminCredential.passwordHash)) {
            throw new common_1.UnauthorizedException('Identifiants invalides ou incorrects');
        }
        const payload = {
            sub: 'admin-1',
            email: adminCredential.email,
            role: 'admin',
        };
        return {
            accessToken: this.jwtService.sign(payload),
            admin: {
                email: adminCredential.email,
                role: 'admin',
            },
        };
    }
    async requestAdminPasswordReset(dto) {
        const adminEmail = this.configService.get('ADMIN_EMAIL');
        const adminPassword = this.configService.get('ADMIN_PASSWORD');
        if (!adminEmail || !adminPassword) {
            throw new common_1.UnauthorizedException('Configuration administrateur incomplète');
        }
        const normalizedEmail = dto.email.trim().toLowerCase();
        const genericMessage = 'Si ce compte existe, un code de reinitialisation a ete envoye par email.';
        if (normalizedEmail !== adminEmail.trim().toLowerCase()) {
            return { message: genericMessage };
        }
        const smtpHost = this.configService.get('SMTP_HOST');
        const smtpPort = Number(this.configService.get('SMTP_PORT') ?? '0');
        const smtpUser = this.configService.get('SMTP_USER');
        const smtpPass = this.configService.get('SMTP_PASS');
        const smtpFrom = this.configService.get('SMTP_FROM');
        if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
            throw new common_1.ServiceUnavailableException('Email de reinitialisation non configure. Configurez SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS et SMTP_FROM.');
        }
        const adminCredential = await this.ensureAdminCredential(adminEmail, adminPassword);
        const resetCode = this.generateResetCode();
        const resetTokenHash = this.hashResetToken(resetCode);
        const resetPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.adminCredential.update({
            where: { id: adminCredential.id },
            data: {
                resetPasswordTokenHash: resetTokenHash,
                resetPasswordExpiresAt,
            },
        });
        const transporter = nodemailer_1.default.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });
        try {
            await transporter.sendMail({
                from: smtpFrom,
                to: adminCredential.email,
                subject: 'Code de reinitialisation admin - Marché du Niger',
                text: `Votre code de reinitialisation admin est: ${resetCode}. Ce code expire dans 10 minutes.`,
                html: `<p>Votre code de reinitialisation admin est: <strong>${resetCode}</strong></p><p>Ce code expire dans 10 minutes.</p>`,
            });
        }
        catch {
            throw new common_1.ServiceUnavailableException('Impossible d\'envoyer le code par email. Verifiez SMTP_USER, SMTP_PASS et SMTP_FROM.');
        }
        return { message: genericMessage };
    }
    async resetAdminPassword(dto) {
        const adminEmail = this.configService.get('ADMIN_EMAIL');
        const adminPassword = this.configService.get('ADMIN_PASSWORD');
        if (!adminEmail || !adminPassword) {
            throw new common_1.UnauthorizedException('Configuration administrateur incomplète');
        }
        const normalizedEmail = dto.email.trim().toLowerCase();
        const token = dto.token.trim();
        if (normalizedEmail !== adminEmail.trim().toLowerCase()) {
            throw new common_1.BadRequestException('Token de reinitialisation invalide ou expire');
        }
        const adminCredential = await this.ensureAdminCredential(adminEmail, adminPassword);
        if (!adminCredential.resetPasswordTokenHash || !adminCredential.resetPasswordExpiresAt) {
            throw new common_1.BadRequestException('Token de reinitialisation invalide ou expire');
        }
        if (adminCredential.resetPasswordExpiresAt.getTime() < Date.now()) {
            throw new common_1.BadRequestException('Token de reinitialisation invalide ou expire');
        }
        const tokenHash = this.hashResetToken(token);
        if (tokenHash !== adminCredential.resetPasswordTokenHash) {
            throw new common_1.BadRequestException('Token de reinitialisation invalide ou expire');
        }
        const passwordHash = this.hashPassword(dto.newPassword);
        await this.prisma.adminCredential.update({
            where: { id: adminCredential.id },
            data: {
                passwordHash,
                resetPasswordTokenHash: null,
                resetPasswordExpiresAt: null,
            },
        });
        return { message: 'Mot de passe admin reinitialise avec succes' };
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
    async requestCustomerPasswordReset(dto) {
        const normalizedEmail = dto.email.trim().toLowerCase();
        const customer = await this.prisma.customer.findUnique({
            where: { email: normalizedEmail },
        });
        if (!customer || !customer.email) {
            return {
                message: 'Si ce compte existe, un code de reinitialisation a ete envoye par email.',
            };
        }
        const smtpHost = this.configService.get('SMTP_HOST');
        const smtpPort = Number(this.configService.get('SMTP_PORT') ?? '0');
        const smtpUser = this.configService.get('SMTP_USER');
        const smtpPass = this.configService.get('SMTP_PASS');
        const smtpFrom = this.configService.get('SMTP_FROM');
        if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
            throw new common_1.ServiceUnavailableException('Email de reinitialisation non configure. Configurez SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS et SMTP_FROM.');
        }
        const resetCode = this.generateResetCode();
        const resetTokenHash = this.hashResetToken(resetCode);
        const resetPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.customer.update({
            where: { id: customer.id },
            data: {
                resetPasswordTokenHash: resetTokenHash,
                resetPasswordExpiresAt,
            },
        });
        const transporter = nodemailer_1.default.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });
        try {
            await transporter.sendMail({
                from: smtpFrom,
                to: normalizedEmail,
                subject: 'Code de reinitialisation - Marché du Niger',
                text: `Votre code de reinitialisation est: ${resetCode}. Ce code expire dans 10 minutes.`,
                html: `<p>Votre code de reinitialisation est: <strong>${resetCode}</strong></p><p>Ce code expire dans 10 minutes.</p>`,
            });
        }
        catch {
            throw new common_1.ServiceUnavailableException('Impossible d\'envoyer le code par email. Verifiez SMTP_USER, SMTP_PASS et SMTP_FROM.');
        }
        return {
            message: 'Si ce compte existe, un code de reinitialisation a ete envoye par email.',
        };
    }
    async resetCustomerPassword(dto) {
        const normalizedEmail = dto.email.trim().toLowerCase();
        const token = dto.token.trim();
        const customer = await this.prisma.customer.findUnique({
            where: { email: normalizedEmail },
        });
        if (!customer || !customer.resetPasswordTokenHash || !customer.resetPasswordExpiresAt) {
            throw new common_1.BadRequestException('Token de reinitialisation invalide ou expire');
        }
        if (customer.resetPasswordExpiresAt.getTime() < Date.now()) {
            throw new common_1.BadRequestException('Token de reinitialisation invalide ou expire');
        }
        const tokenHash = this.hashResetToken(token);
        if (tokenHash !== customer.resetPasswordTokenHash) {
            throw new common_1.BadRequestException('Token de reinitialisation invalide ou expire');
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
    hashResetToken(token) {
        return (0, node_crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    generateResetCode() {
        return String(Math.floor(100000 + Math.random() * 900000));
    }
    async ensureAdminCredential(adminEmail, adminPassword) {
        const normalizedEmail = adminEmail.trim().toLowerCase();
        const existing = await this.prisma.adminCredential.findUnique({
            where: { email: normalizedEmail },
        });
        if (existing) {
            return existing;
        }
        return this.prisma.adminCredential.create({
            data: {
                id: 'admin-1',
                email: normalizedEmail,
                passwordHash: this.hashPassword(adminPassword),
            },
        });
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