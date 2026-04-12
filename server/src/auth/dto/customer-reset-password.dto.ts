import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CustomerResetPasswordDto {
  @ApiProperty({ example: 'client@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'f2e70a7a1f...' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'nouveauMotDePasse123' })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
