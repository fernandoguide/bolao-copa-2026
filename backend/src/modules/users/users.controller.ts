import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { Request } from "express";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Req() req: Request) {
    const user = await this.usersService.findById((req as any).user.id);
    return user;
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }
}
