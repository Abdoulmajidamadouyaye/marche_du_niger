import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../shared/prisma/prisma.service';
import { OrderEntity, OrdersAnalyticsEntity } from '../shared/types/domain.types';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.toEntity(order));
  }

  async create(dto: CreateOrderDto): Promise<OrderEntity> {
    const now = new Date().toISOString();
    const order = await this.prisma.order.create({
      data: {
      id: `NM-${Date.now()}`,
      items: dto.items as unknown as Prisma.InputJsonValue,
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

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<OrderEntity> {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException('Commande introuvable');
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

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    await this.prisma.order.delete({ where: { id } });
    return { deleted: true, id };
  }

  async findByCustomer(customerPhone: string): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      where: { customerPhone },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.toEntity(order));
  }

  async getAnalytics(days: number = 7): Promise<OrdersAnalyticsEntity> {
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

    const ordersPerDayMap = new Map<string, number>();
    const topProductsMap = new Map<string, { productId: string; productName: string; quantity: number }>();
    const activeCitiesMap = new Map<string, number>();

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
        const item = rawItem as { productId?: string; productName?: string; quantity?: number };
        const productId = item.productId ?? 'unknown';
        const productName = item.productName ?? 'Produit inconnu';
        const quantity = Number(item.quantity ?? 0);
        if (quantity <= 0) continue;
        const key = `${productId}|${productName}`;
        const existing = topProductsMap.get(key);
        if (existing) {
          existing.quantity += quantity;
        } else {
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

  private toEntity(order: {
    id: string;
    items: Prisma.JsonValue;
    subtotal: number;
    paymentMethod: string;
    customerFirstName: string | null;
    customerLastName: string | null;
    customerPhone: string | null;
    customerCity: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): OrderEntity {
    return {
      id: order.id,
      items: order.items as unknown as OrderEntity['items'],
      subtotal: order.subtotal,
      paymentMethod: order.paymentMethod as OrderEntity['paymentMethod'],
      customerFirstName: order.customerFirstName ?? '',
      customerLastName: order.customerLastName ?? '',
      customerPhone: order.customerPhone ?? '',
      customerCity: order.customerCity ?? '',
      status: order.status as OrderEntity['status'],
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
