import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'abdoulmajidamadouyaye47@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Abdoulmajid47@' })
  @IsString()
  @MinLength(6)
  password!: string;
}
