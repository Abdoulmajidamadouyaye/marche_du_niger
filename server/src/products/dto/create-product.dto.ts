import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { COUNTRIES } from '../../constants/regions';

class VehicleSpecsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty()
  @IsNumber()
  @Min(1900)
  year!: number;

  @ApiProperty({ enum: ['Essence', 'Diesel', 'Hybride', 'Electrique'] })
  @IsIn(['Essence', 'Diesel', 'Hybride', 'Electrique'])
  engineType!: 'Essence' | 'Diesel' | 'Hybride' | 'Electrique';

  @ApiProperty()
  @IsNumber()
  @Min(1)
  horsepower!: number;

  @ApiProperty({ enum: ['Automatique', 'Manuelle'] })
  @IsIn(['Automatique', 'Manuelle'])
  transmission!: 'Automatique' | 'Manuelle';

  @ApiProperty({ description: 'Consommation en L/100km' })
  @IsNumber()
  @Min(0)
  fuelConsumption!: number;

  @ApiProperty({ description: 'Autonomie en km' })
  @IsNumber()
  @Min(0)
  autonomy!: number;

  @ApiProperty({ description: 'Capacité du réservoir en litres' })
  @IsNumber()
  @Min(0)
  tankCapacity!: number;

  @ApiProperty({ description: 'Kilométrage en km' })
  @IsNumber()
  @Min(0)
  mileage!: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  doors!: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  seats!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  color!: string;

  @ApiProperty()
  @IsBoolean()
  airbags!: boolean;

  @ApiProperty()
  @IsBoolean()
  abs!: boolean;

  @ApiProperty()
  @IsBoolean()
  reverseCamera!: boolean;

  @ApiProperty()
  @IsBoolean()
  airConditioning!: boolean;

  @ApiProperty()
  @IsBoolean()
  gpsNavigation!: boolean;

  @ApiProperty()
  @IsBoolean()
  touchScreen!: boolean;

  @ApiProperty({ enum: ['neuf', 'occasion'] })
  @IsIn(['neuf', 'occasion'])
  condition!: 'neuf' | 'occasion';

  @ApiProperty()
  @IsBoolean()
  papersAvailable!: boolean;
}

class MotoSpecsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty()
  @IsNumber()
  @Min(1900)
  year!: number;

  @ApiProperty({ enum: ['Sport', 'Cross', 'Scooter', 'Routière', 'Autre'] })
  @IsIn(['Sport', 'Cross', 'Scooter', 'Routière', 'Autre'])
  motoType!: 'Sport' | 'Cross' | 'Scooter' | 'Routière' | 'Autre';

  @ApiProperty({ enum: ['2 temps', '4 temps'] })
  @IsIn(['2 temps', '4 temps'])
  engineType!: '2 temps' | '4 temps';

  @ApiProperty({ description: 'Vitesse maximale km/h' })
  @IsNumber()
  @Min(0)
  maxSpeed!: number;

  @ApiProperty({ description: 'Poids en kg' })
  @IsNumber()
  @Min(0)
  weight!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  color!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tireType!: string;

  @ApiProperty({ description: 'Kilométrage en km' })
  @IsNumber()
  @Min(0)
  mileage!: number;

  @ApiProperty({ enum: ['ville', 'route', 'tout-terrain'] })
  @IsIn(['ville', 'route', 'tout-terrain'])
  usage!: 'ville' | 'route' | 'tout-terrain';

  @ApiProperty({ description: 'Consommation en L/100km' })
  @IsNumber()
  @Min(0)
  fuelConsumption!: number;

  @ApiProperty({ description: 'Capacité du réservoir en litres' })
  @IsNumber()
  @Min(0)
  tankCapacity!: number;

  @ApiProperty({ enum: ['disque', 'tambour', 'disque + tambour'] })
  @IsIn(['disque', 'tambour', 'disque + tambour'])
  brakes!: 'disque' | 'tambour' | 'disque + tambour';

  @ApiProperty()
  @IsBoolean()
  antiTheft!: boolean;

  @ApiProperty()
  @IsBoolean()
  ledLighting!: boolean;

  @ApiProperty()
  @IsBoolean()
  electricStart!: boolean;

  @ApiProperty()
  @IsBoolean()
  digitalDashboard!: boolean;

  @ApiProperty({ enum: ['neuf', 'occasion'] })
  @IsIn(['neuf', 'occasion'])
  condition!: 'neuf' | 'occasion';

  @ApiProperty()
  @IsBoolean()
  papersAvailable!: boolean;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shortDescription!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  colors!: string[];

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  @IsObject()
  images!: Record<string, string>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ type: VehicleSpecsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VehicleSpecsDto)
  vehicleSpecs?: VehicleSpecsDto;

  @ApiPropertyOptional({ type: MotoSpecsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MotoSpecsDto)
  motoSpecs?: MotoSpecsDto;

  @ApiPropertyOptional({ enum: Object.values(COUNTRIES) })
  @IsOptional()
  @IsIn(Object.values(COUNTRIES))
  country?: string;

  @ApiPropertyOptional({ type: [String], description: 'Array of region codes for Niger or location for Benin' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  @ApiPropertyOptional({ description: 'Delai d\'expedition en jours (Benin)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingDelayDays?: number;
}
