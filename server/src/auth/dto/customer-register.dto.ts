import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class CustomerRegisterDto {
  @ApiProperty({ example: 'Issa' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Abdou' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: '+22790000000' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{8,15}$/)
  phone!: string;

  @ApiProperty({ example: 'ali@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @MinLength(6)
  password!: string;
}