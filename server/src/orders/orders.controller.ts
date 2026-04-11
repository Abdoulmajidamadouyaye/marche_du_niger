import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('analytics')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  getAnalytics() {
    return this.ordersService.getAnalytics(14);
  }

  @Get('mine')
  @ApiBearerAuth()
  @UseGuards(CustomerAuthGuard)
  findMine(@Request() req: any) {
    const customerPhone = req.customer?.phone;
    if (!customerPhone) {
      return [];
    }
    return this.ordersService.findByCustomer(customerPhone);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
