import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private async dispatchLogin(dto: LoginDto, forcedRole?: 'admin' | 'customer') {
    const role = forcedRole ?? dto.role ?? 'customer';
    const service = this.authService as unknown as Record<string, unknown>;

    const generic =
      (service['login'] as ((payload: LoginDto) => Promise<unknown>) | undefined) ??
      (service['signIn'] as ((payload: LoginDto) => Promise<unknown>) | undefined);

    const admin =
      (service['loginAdmin'] as ((payload: LoginDto) => Promise<unknown>) | undefined) ??
      (service['adminLogin'] as ((payload: LoginDto) => Promise<unknown>) | undefined);

    const customer =
      (service['loginCustomer'] as ((payload: LoginDto) => Promise<unknown>) | undefined) ??
      (service['customerLogin'] as ((payload: LoginDto) => Promise<unknown>) | undefined);

    if (role === 'admin' && admin) return admin({ ...dto, role: 'admin' });
    if (role === 'customer' && customer) return customer({ ...dto, role: 'customer' });
    if (generic) return generic({ ...dto, role });

    throw new InternalServerErrorException(
      "Aucune méthode de connexion compatible n'a été trouvée dans AuthService.",
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Connexion générique admin/client' })
  @ApiBody({ type: LoginDto })
  login(@Body() dto: LoginDto) {
    return this.dispatchLogin(dto);
  }

  @Post('admin/login')
  @ApiOperation({ summary: 'Connexion administrateur' })
  @ApiBody({ type: LoginDto })
  loginAdmin(@Body() dto: LoginDto) {
    return this.dispatchLogin(dto, 'admin');
  }

  @Post('customer/login')
  @ApiOperation({ summary: 'Connexion client' })
  @ApiBody({ type: LoginDto })
  loginCustomer(@Body() dto: LoginDto) {
    return this.dispatchLogin(dto, 'customer');
  }
}
