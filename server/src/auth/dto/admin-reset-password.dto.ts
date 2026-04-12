import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminResetPasswordDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'nouveauMotDePasseAdmin123' })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
