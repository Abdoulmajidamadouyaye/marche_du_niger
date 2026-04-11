import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@nigermarcher.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'admin2024' })
  @IsString()
  @MinLength(6)
  password!: string;
}
