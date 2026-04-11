"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    async onModuleInit() {
        await this.$connect();
        await this.bootstrapData();
    }
    async bootstrapData() {
        const legacyStorePath = (0, node_path_1.join)(process.cwd(), 'data', 'store.json');
        const legacyStore = this.readLegacyStore(legacyStorePath);
        const seedProductsPath = (0, node_path_1.join)(process.cwd(), 'prisma', 'seed-data.json');
        const prismaSeedProducts = this.readPrismaSeedProducts(seedProductsPath);
        const products = [...prismaSeedProducts, ...(legacyStore?.products ?? [])];
        const orders = legacyStore?.orders ?? [];
        const existingProducts = await this.product.findMany({
            select: { id: true, name: true, categorySlug: true },
        });
        const existingOrders = await this.order.findMany({
            select: { id: true },
        });
        const existingProductIds = new Set(existingProducts.map((product) => product.id));
        const existingProductKeys = new Set(existingProducts.map((product) => `${product.name.toLowerCase()}::${product.categorySlug.toLowerCase()}`));
        const existingOrderIds = new Set(existingOrders.map((order) => order.id));
        const uniqueProducts = products.filter((product) => {
            const productKey = `${product.name.toLowerCase()}::${product.categorySlug.toLowerCase()}`;
            if (existingProductIds.has(product.id) || existingProductKeys.has(productKey)) {
                return false;
            }
            existingProductIds.add(product.id);
            existingProductKeys.add(productKey);
            return true;
        });
        const uniqueOrders = orders.filter((order) => {
            if (existingOrderIds.has(order.id)) {
                return false;
            }
            existingOrderIds.add(order.id);
            return true;
        });
        if (uniqueProducts.length > 0) {
            await this.product.createMany({
                data: uniqueProducts.map((product) => ({
                    ...product,
                    sizes: product.sizes ?? undefined,
                    colors: product.colors,
                    images: product.images,
                    vehicleSpecs: product.vehicleSpecs ?? undefined,
                    motoSpecs: product.motoSpecs ?? undefined,
                    createdAt: new Date(product.createdAt),
                    updatedAt: new Date(product.updatedAt),
                })),
            });
        }
        if (uniqueOrders.length > 0) {
            await this.order.createMany({
                data: uniqueOrders.map((order) => ({
                    ...order,
                    items: order.items,
                    createdAt: new Date(order.createdAt),
                    updatedAt: new Date(order.updatedAt),
                })),
            });
        }
    }
    readLegacyStore(storePath) {
        if (!(0, node_fs_1.existsSync)(storePath)) {
            return null;
        }
        try {
            return JSON.parse((0, node_fs_1.readFileSync)(storePath, 'utf-8'));
        }
        catch {
            return null;
        }
    }
    readPrismaSeedProducts(seedPath) {
        if (!(0, node_fs_1.existsSync)(seedPath)) {
            return [];
        }
        try {
            const parsed = JSON.parse((0, node_fs_1.readFileSync)(seedPath, 'utf-8'));
            const now = new Date().toISOString();
            return parsed.map((product) => ({
                ...product,
                createdAt: product.createdAt ?? now,
                updatedAt: product.updatedAt ?? now,
            }));
        }
        catch {
            return [];
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map