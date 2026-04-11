import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { OrderStatus } from '../../shared/types/domain.types';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['pending', 'confirmed', 'in_delivery', 'delivered', 'cancelled'] })
  @IsIn(['pending', 'confirmed', 'in_delivery', 'shipped', 'delivered', 'cancelled'])
  status!: OrderStatus;
}
