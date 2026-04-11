import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto): Promise<import("../shared/types/domain.types").OrderEntity>;
    findAll(): Promise<import("../shared/types/domain.types").OrderEntity[]>;
    getAnalytics(): Promise<import("../shared/types/domain.types").OrdersAnalyticsEntity>;
    findMine(req: any): never[] | Promise<import("../shared/types/domain.types").OrderEntity[]>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<import("../shared/types/domain.types").OrderEntity>;
    remove(id: string): Promise<{
        deleted: true;
        id: string;
    }>;
}
