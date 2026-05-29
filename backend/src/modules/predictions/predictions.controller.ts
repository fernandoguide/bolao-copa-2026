import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { PredictionsService } from "./predictions.service";
import { CreatePredictionDto } from "./dto/create-prediction.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("predictions")
@UseGuards(JwtAuthGuard)
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreatePredictionDto) {
    return this.predictionsService.create((req as any).user.id, dto);
  }

  @Get("my")
  async findMine(@Req() req: Request) {
    return this.predictionsService.findByUser((req as any).user.id);
  }

  @Get("match/:matchId")
  async findByMatch(@Param("matchId") matchId: number) {
    return this.predictionsService.findByMatch(matchId);
  }
}
