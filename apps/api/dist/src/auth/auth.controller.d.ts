import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: any;
        user: any;
    } | {
        message: string;
    }>;
    signup(signUpDto: any): Promise<User>;
    getProfile(req: any): any;
}
