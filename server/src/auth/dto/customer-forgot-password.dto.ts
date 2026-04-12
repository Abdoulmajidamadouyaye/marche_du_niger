import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CustomerForgotPasswordDto {
  @ApiProperty({ example: 'client@example.com' })
  @IsEmail()
  email!: string;
}
