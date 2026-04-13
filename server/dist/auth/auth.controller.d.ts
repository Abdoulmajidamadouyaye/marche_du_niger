import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    private dispatchLogin;
    login(dto: LoginDto): Promise<unknown>;
    loginAdmin(dto: LoginDto): Promise<unknown>;
    loginCustomer(dto: LoginDto): Promise<unknown>;
}
