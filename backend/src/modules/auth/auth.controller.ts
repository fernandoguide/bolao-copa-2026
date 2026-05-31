import { Controller, Post, Body } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Rate limit estrito: 5 tentativas por 5 minutos para registro
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // Rate limit estrito: 10 tentativas por 5 minutos para login
  @Throttle({ default: { limit: 10, ttl: 300000 } })
  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
