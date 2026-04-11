import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class SetPromotionDto {
  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(1)
  @Max(90)
  discountPercent!: number;
}
