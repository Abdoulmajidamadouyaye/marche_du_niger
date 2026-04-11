import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CustomerLoginDto {
  @ApiProperty({ example: 'ali@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @MinLength(6)
  password!: string;
}