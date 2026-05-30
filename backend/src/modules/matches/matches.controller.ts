import { Controller, Get, Param, Patch, Body, UseGuards } from "@nestjs/common";
import { MatchesService } from "./matches.service";
import { MatchStage } from "./entities/match.entity";
import { UpdateResultDto } from "./dto/update-result.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { PredictionsService } from "../predictions/predictions.service";

@Controller("matches")
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly predictionsService: PredictionsService
  ) {}

  @Get()
  async findAll() {
    return this.matchesService.findAll();
  }

  @Get("upcoming")
  async findUpcoming() {
    return this.matchesService.findUpcoming();
  }

  @Get("stage/:stage")
  async findByStage(@Param("stage") stage: MatchStage) {
    return this.matchesService.findByStage(stage);
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    return this.matchesService.findById(id);
  }

  @Patch(":id/result")
  @UseGuards(AdminGuard)
  async updateResult(@Param("id") id: number, @Body() dto: UpdateResultDto) {
    const match = await this.matchesService.updateResult(
      id,
      dto.homeScore,
      dto.awayScore
    );
    await this.predictionsService.calculatePoints(id);
    return match;
  }
}
