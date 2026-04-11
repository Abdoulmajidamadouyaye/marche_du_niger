import { PrismaService } from '../shared/prisma/prisma.service';
import { OrderEntity, OrdersAnalyticsEntity } from '../shared/types/domain.types';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<OrderEntity[]>;
    create(dto: CreateOrderDto): Promise<OrderEntity>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<OrderEntity>;
    remove(id: string): Promise<{
        deleted: true;
        id: string;
    }>;
    findByCustomer(customerPhone: string): Promise<OrderEntity[]>;
    getAnalytics(days?: number): Promise<OrdersAnalyticsEntity>;
    private toEntity;
}
