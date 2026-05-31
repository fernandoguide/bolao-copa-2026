import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from "@nestjs/common";
import { Request } from "express";
import { PoolsService } from "./pools.service";
import { CreatePoolDto } from "./dto/create-pool.dto";
import { JoinPoolDto } from "./dto/join-pool.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("pools")
@UseGuards(JwtAuthGuard)
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreatePoolDto) {
    return this.poolsService.create((req as any).user.id, dto);
  }

  @Post("join")
  async join(@Req() req: Request, @Body() dto: JoinPoolDto) {
    return this.poolsService.joinByCode((req as any).user.id, dto.inviteCode);
  }

  @Get("my")
  async findMyPools(@Req() req: Request) {
    return this.poolsService.findMyPools((req as any).user.id);
  }

  @Get(":id")
  async findOne(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    return this.poolsService.findPoolWithMembers(id, (req as any).user.id);
  }

  @Delete(":id/leave")
  async leave(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    return this.poolsService.leavePool(id, (req as any).user.id);
  }

  @Delete(":id")
  async delete(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    return this.poolsService.deletePool(id, (req as any).user.id);
  }
}
