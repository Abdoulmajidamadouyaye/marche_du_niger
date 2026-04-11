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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../shared/prisma/prisma.service");
const slugify_1 = require("../shared/utils/slugify");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(category) {
        if (!category) {
            const products = await this.prisma.product.findMany({
                orderBy: { createdAt: 'desc' },
            });
            return products.map((product) => this.toEntity(product));
        }
        const products = await this.prisma.product.findMany({
            where: {
                OR: [
                    { categorySlug: (0, slugify_1.slugify)(category) },
                    { categorySlug: category.toLowerCase() },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
        return products.map((product) => this.toEntity(product));
    }
    async findAllPaginated(category, limit = 10, skip = 0) {
        const whereClause = category
            ? {
                OR: [
                    { categorySlug: (0, slugify_1.slugify)(category) },
                    { categorySlug: category.toLowerCase() },
                ],
            }
            : undefined;
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: skip,
            }),
            this.prisma.product.count({ where: whereClause }),
        ]);
        return {
            data: products.map((product) => this.toEntity(product)),
            total,
            count: products.length,
            skip,
            limit,
        };
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException('Produit introuvable');
        }
        return this.toEntity(product);
    }
    async create(dto) {
        const now = new Date().toISOString();
        const product = await this.prisma.product.create({
            data: {
                id: crypto.randomUUID(),
                name: dto.name,
                shortDescription: dto.shortDescription,
                description: dto.description,
                price: dto.price,
                inStock: dto.inStock ?? true,
                category: dto.category,
                categorySlug: dto.categorySlug ? (0, slugify_1.slugify)(dto.categorySlug) : (0, slugify_1.slugify)(dto.category),
                sizes: dto.sizes ?? undefined,
                colors: dto.colors,
                images: dto.images,
                vehicleSpecs: dto.vehicleSpecs ?? undefined,
                motoSpecs: dto.motoSpecs ?? undefined,
                country: dto.country ?? undefined,
                regions: dto.regions ?? undefined,
                shippingDelayDays: dto.shippingDelayDays ?? undefined,
                createdAt: new Date(now),
                updatedAt: new Date(now),
            },
        });
        return this.toEntity(product);
    }
    async update(id, dto) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException('Produit introuvable');
        }
        const updated = await this.prisma.product.update({
            where: { id },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.shortDescription !== undefined ? { shortDescription: dto.shortDescription } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.price !== undefined ? { price: dto.price } : {}),
                ...(dto.inStock !== undefined ? { inStock: dto.inStock } : {}),
                ...(dto.category !== undefined ? { category: dto.category } : {}),
                categorySlug: dto.categorySlug
                    ? (0, slugify_1.slugify)(dto.categorySlug)
                    : dto.category
                        ? (0, slugify_1.slugify)(dto.category)
                        : product.categorySlug,
                ...(dto.sizes !== undefined ? { sizes: dto.sizes } : {}),
                ...(dto.colors !== undefined ? { colors: dto.colors } : {}),
                ...(dto.images !== undefined ? { images: dto.images } : {}),
                ...(dto.vehicleSpecs !== undefined ? { vehicleSpecs: dto.vehicleSpecs } : {}),
                ...(dto.motoSpecs !== undefined ? { motoSpecs: dto.motoSpecs } : {}),
                ...(dto.country !== undefined ? { country: dto.country ?? null } : {}),
                ...(dto.regions !== undefined ? { regions: dto.regions } : {}),
                ...(dto.shippingDelayDays !== undefined ? { shippingDelayDays: dto.shippingDelayDays } : {}),
                updatedAt: new Date(),
            },
        });
        return this.toEntity(updated);
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.product.delete({ where: { id } });
        return { deleted: true, id };
    }
    async setPromotion(id, dto) {
        const product = await this.findOne(id);
        const originalPrice = product.originalPrice ?? product.price;
        const discountedPrice = Math.round(originalPrice * (1 - dto.discountPercent / 100));
        const updated = await this.prisma.product.update({
            where: { id },
            data: {
                originalPrice,
                discountPercent: dto.discountPercent,
                price: discountedPrice,
                updatedAt: new Date(),
            },
        });
        return this.toEntity(updated);
    }
    async clearPromotion(id) {
        const product = await this.findOne(id);
        const updated = await this.prisma.product.update({
            where: { id },
            data: {
                price: product.originalPrice ?? product.price,
                originalPrice: null,
                discountPercent: null,
                updatedAt: new Date(),
            },
        });
        return this.toEntity(updated);
    }
    async search(query, limit = 50, skip = 0) {
        const searchTerm = query.trim().toLowerCase();
        if (!searchTerm) {
            return { items: [], total: 0 };
        }
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm } },
                        { shortDescription: { contains: searchTerm } },
                        { description: { contains: searchTerm } },
                        { category: { contains: searchTerm } },
                    ],
                },
                orderBy: [
                    { createdAt: 'desc' },
                ],
                take: limit,
                skip: skip,
            }),
            this.prisma.product.count({
                where: {
                    OR: [
                        { name: { contains: searchTerm } },
                        { shortDescription: { contains: searchTerm } },
                        { description: { contains: searchTerm } },
                        { category: { contains: searchTerm } },
                    ],
                },
            }),
        ]);
        return {
            items: products.map((p) => this.toEntity(p)),
            total,
        };
    }
    toEntity(product) {
        return {
            id: product.id,
            name: product.name,
            shortDescription: product.shortDescription,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice ?? undefined,
            discountPercent: product.discountPercent ?? undefined,
            inStock: product.inStock,
            category: product.category,
            categorySlug: product.categorySlug,
            sizes: product.sizes ?? undefined,
            colors: product.colors,
            images: product.images,
            vehicleSpecs: product.vehicleSpecs ?? undefined,
            motoSpecs: product.motoSpecs ?? undefined,
            country: product.country ?? undefined,
            regions: product.regions ?? undefined,
            shippingDelayDays: product.shippingDelayDays ?? undefined,
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map