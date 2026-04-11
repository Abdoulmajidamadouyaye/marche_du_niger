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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../shared/prisma/prisma.service");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const orders = await this.prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return orders.map((order) => this.toEntity(order));
    }
    async create(dto) {
        const now = new Date().toISOString();
        const order = await this.prisma.order.create({
            data: {
                id: `NM-${Date.now()}`,
                items: dto.items,
                subtotal: dto.subtotal,
                paymentMethod: dto.paymentMethod,
                customerFirstName: dto.customerFirstName,
                customerLastName: dto.customerLastName,
                customerPhone: dto.customerPhone,
                customerCity: dto.customerCity?.trim() ?? null,
                status: 'pending',
                createdAt: new Date(now),
                updatedAt: new Date(now),
            },
        });
        return this.toEntity(order);
    }
    async updateStatus(id, dto) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('Commande introuvable');
        }
        const updated = await this.prisma.order.update({
            where: { id },
            data: {
                status: dto.status,
                updatedAt: new Date(),
            },
        });
        return this.toEntity(updated);
    }
    async remove(id) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('Commande introuvable');
        }
        await this.prisma.order.delete({ where: { id } });
        return { deleted: true, id };
    }
    async findByCustomer(customerPhone) {
        const orders = await this.prisma.order.findMany({
            where: { customerPhone },
            orderBy: { createdAt: 'desc' },
        });
        return orders.map((order) => this.toEntity(order));
    }
    async getAnalytics(days = 7) {
        const safeDays = Math.min(Math.max(days, 1), 60);
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - (safeDays - 1));
        start.setHours(0, 0, 0, 0);
        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: {
                    gte: start,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const ordersPerDayMap = new Map();
        const topProductsMap = new Map();
        const activeCitiesMap = new Map();
        for (const order of orders) {
            const day = order.createdAt.toISOString().slice(0, 10);
            ordersPerDayMap.set(day, (ordersPerDayMap.get(day) ?? 0) + 1);
            const city = (order.customerCity ?? '').trim();
            if (city) {
                const normalizedCity = city.toLowerCase();
                activeCitiesMap.set(normalizedCity, (activeCitiesMap.get(normalizedCity) ?? 0) + 1);
            }
            const items = Array.isArray(order.items) ? order.items : [];
            for (const rawItem of items) {
                const item = rawItem;
                const productId = item.productId ?? 'unknown';
                const productName = item.productName ?? 'Produit inconnu';
                const quantity = Number(item.quantity ?? 0);
                if (quantity <= 0)
                    continue;
                const key = `${productId}|${productName}`;
                const existing = topProductsMap.get(key);
                if (existing) {
                    existing.quantity += quantity;
                }
                else {
                    topProductsMap.set(key, { productId, productName, quantity });
                }
            }
        }
        const ordersPerDay = Array.from(ordersPerDayMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
        const topProducts = Array.from(topProductsMap.values())
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
        const activeCities = Array.from(activeCitiesMap.entries())
            .map(([city, count]) => ({
            city: city.charAt(0).toUpperCase() + city.slice(1),
            count,
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return {
            ordersPerDay,
            topProducts,
            activeCities,
        };
    }
    toEntity(order) {
        return {
            id: order.id,
            items: order.items,
            subtotal: order.subtotal,
            paymentMethod: order.paymentMethod,
            customerFirstName: order.customerFirstName ?? '',
            customerLastName: order.customerLastName ?? '',
            customerPhone: order.customerPhone ?? '',
            customerCity: order.customerCity ?? '',
            status: order.status,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map