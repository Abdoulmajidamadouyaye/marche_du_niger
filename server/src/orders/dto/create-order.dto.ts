import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty()
  @IsString()
  productName!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  productImage?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiProperty()
  @IsNumber()
  @Min(0)
  subtotal!: number;

  @ApiProperty({ enum: ['card', 'mynita', 'amana', 'cod'] })
  @IsString()
  @IsIn(['card', 'mynita', 'amana', 'cod'])
  paymentMethod!: 'card' | 'mynita' | 'amana' | 'cod';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerFirstName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerLastName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerCity?: string;
}
