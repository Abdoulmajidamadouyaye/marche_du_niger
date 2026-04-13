import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail({}, { message: 'Email invalide.' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères.' })
  password!: string;

  @ApiPropertyOptional({ enum: ['admin', 'customer'], example: 'customer' })
  @IsOptional()
  @IsIn(['admin', 'customer'], { message: 'Le rôle doit être admin ou customer.' })
  role?: 'admin' | 'customer';
}