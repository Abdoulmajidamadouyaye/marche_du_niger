import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { OrderEntity, ProductEntity } from '../types/domain.types';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
    await this.bootstrapData();
  }

  private async bootstrapData(): Promise<void> {
    const legacyStorePath = join(process.cwd(), 'data', 'store.json');
    const legacyStore = this.readLegacyStore(legacyStorePath);

    const seedProductsPath = join(process.cwd(), 'prisma', 'seed-data.json');
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
    const existingProductKeys = new Set(
      existingProducts.map((product) => `${product.name.toLowerCase()}::${product.categorySlug.toLowerCase()}`),
    );
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
          sizes: (product.sizes as unknown as Prisma.InputJsonValue | undefined) ?? undefined,
          colors: product.colors as unknown as Prisma.InputJsonValue,
          images: product.images as unknown as Prisma.InputJsonValue,
          vehicleSpecs: (product.vehicleSpecs as unknown as Prisma.InputJsonValue | undefined) ?? undefined,
          motoSpecs: (product.motoSpecs as unknown as Prisma.InputJsonValue | undefined) ?? undefined,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt),
        })),
      });
    }

    if (uniqueOrders.length > 0) {
      await this.order.createMany({
        data: uniqueOrders.map((order) => ({
          ...order,
          items: order.items as unknown as Prisma.InputJsonValue,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
        })),
      });
    }
  }

  private readLegacyStore(storePath: string): { products?: ProductEntity[]; orders?: OrderEntity[] } | null {
    if (!existsSync(storePath)) {
      return null;
    }

    try {
      return JSON.parse(readFileSync(storePath, 'utf-8')) as {
        products?: ProductEntity[];
        orders?: OrderEntity[];
      };
    } catch {
      return null;
    }
  }

  private readPrismaSeedProducts(seedPath: string): ProductEntity[] {
    if (!existsSync(seedPath)) {
      return [];
    }

    try {
      const parsed = JSON.parse(readFileSync(seedPath, 'utf-8')) as Array<
        Omit<ProductEntity, 'createdAt' | 'updatedAt'> &
          Partial<Pick<ProductEntity, 'createdAt' | 'updatedAt'>>
      >;

      const now = new Date().toISOString();
      return parsed.map((product) => ({
        ...product,
        createdAt: product.createdAt ?? now,
        updatedAt: product.updatedAt ?? now,
      }));
    } catch {
      return [];
    }
  }
}