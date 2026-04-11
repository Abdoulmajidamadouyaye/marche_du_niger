import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CustomerAuthGuard } from './guards/customer-auth.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
          throw new Error('JWT_SECRET environment variable is required');
        }
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: '12h',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CustomerAuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
