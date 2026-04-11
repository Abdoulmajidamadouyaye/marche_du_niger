import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Number of items to skip', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number = 0;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items' })
  data!: T[];

  @ApiProperty({ description: 'Total number of items' })
  total!: number;

  @ApiProperty({ description: 'Number of items returned' })
  count!: number;

  @ApiProperty({ description: 'Current page offset' })
  skip!: number;

  @ApiProperty({ description: 'Items per page limit' })
  limit!: number;
}
