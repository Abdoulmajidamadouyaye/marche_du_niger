import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductEntity } from '../shared/types/domain.types';
import { PrismaService } from '../shared/prisma/prisma.service';
import { slugify } from '../shared/utils/slugify';
import { CreateProductDto } from './dto/create-product.dto';
import { SetPromotionDto } from './dto/set-promotion.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginatedResponseDto } from '../shared/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string): Promise<ProductEntity[]> {
    if (!category) {
      const products = await this.prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return products.map((product) => this.toEntity(product));
    }

    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { categorySlug: slugify(category) },
          { categorySlug: category.toLowerCase() },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => this.toEntity(product));
  }

  async findAllPaginated(
    category?: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<PaginatedResponseDto<ProductEntity>> {
    const whereClause = category
      ? {
          OR: [
            { categorySlug: slugify(category) },
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

  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }

    return this.toEntity(product);
  }

  async create(dto: CreateProductDto): Promise<ProductEntity> {
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
      categorySlug: dto.categorySlug ? slugify(dto.categorySlug) : slugify(dto.category),
      sizes: (dto.sizes as unknown as Prisma.InputJsonValue | undefined) ?? undefined,
      colors: dto.colors as unknown as Prisma.InputJsonValue,
      images: dto.images as unknown as Prisma.InputJsonValue,
      vehicleSpecs: (dto.vehicleSpecs as unknown as Prisma.InputJsonValue | undefined) ?? undefined,
      motoSpecs: (dto.motoSpecs as unknown as Prisma.InputJsonValue | undefined) ?? undefined,
      country: dto.country ?? undefined,
      regions: (dto.regions as unknown as Prisma.InputJsonValue | undefined) ?? undefined,
      shippingDelayDays: dto.shippingDelayDays ?? undefined,
      createdAt: new Date(now),
      updatedAt: new Date(now),
      },
    });

    return this.toEntity(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Produit introuvable');
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
          ? slugify(dto.categorySlug)
          : dto.category
            ? slugify(dto.category)
            : product.categorySlug,
        ...(dto.sizes !== undefined ? { sizes: dto.sizes as unknown as Prisma.InputJsonValue } : {}),
        ...(dto.colors !== undefined ? { colors: dto.colors as unknown as Prisma.InputJsonValue } : {}),
        ...(dto.images !== undefined ? { images: dto.images as unknown as Prisma.InputJsonValue } : {}),
        ...(dto.vehicleSpecs !== undefined ? { vehicleSpecs: dto.vehicleSpecs as unknown as Prisma.InputJsonValue } : {}),
        ...(dto.motoSpecs !== undefined ? { motoSpecs: dto.motoSpecs as unknown as Prisma.InputJsonValue } : {}),
        ...(dto.country !== undefined ? { country: dto.country ?? null } : {}),
        ...(dto.regions !== undefined ? { regions: dto.regions as unknown as Prisma.InputJsonValue } : {}),
        ...(dto.shippingDelayDays !== undefined ? { shippingDelayDays: dto.shippingDelayDays } : {}),
        updatedAt: new Date(),
      },
    });

    return this.toEntity(updated);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { deleted: true, id };
  }

  async setPromotion(id: string, dto: SetPromotionDto): Promise<ProductEntity> {
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

  async clearPromotion(id: string): Promise<ProductEntity> {
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

  async search(query: string, limit: number = 50, skip: number = 0): Promise<{ items: ProductEntity[]; total: number }> {
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

  private toEntity(product: {
    id: string;
    name: string;
    shortDescription: string;
    description: string;
    price: number;
    originalPrice: number | null;
    discountPercent: number | null;
    inStock: boolean;
    category: string;
    categorySlug: string;
    sizes: Prisma.JsonValue | null;
    colors: Prisma.JsonValue;
    images: Prisma.JsonValue;
    vehicleSpecs: Prisma.JsonValue | null;
    motoSpecs: Prisma.JsonValue | null;
    country: string | null;
    regions: Prisma.JsonValue | null;
    shippingDelayDays: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): ProductEntity {
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
      sizes: (product.sizes as string[] | null) ?? undefined,
      colors: product.colors as string[],
      images: product.images as Record<string, string>,
      vehicleSpecs: (product.vehicleSpecs as ProductEntity['vehicleSpecs'] | null) ?? undefined,
      motoSpecs: (product.motoSpecs as ProductEntity['motoSpecs'] | null) ?? undefined,
      country: product.country ?? undefined,
      regions: (product.regions as string[] | null) ?? undefined,
      shippingDelayDays: product.shippingDelayDays ?? undefined,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
