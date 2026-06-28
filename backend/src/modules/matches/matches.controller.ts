import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from "@nestjs/common";
import { MatchesService } from "./matches.service";
import { MatchStage } from "./entities/match.entity";
import { UpdateResultDto } from "./dto/update-result.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { PredictionsService } from "../predictions/predictions.service";

const VALID_STAGES = Object.values(MatchStage);

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
  async findByStage(@Param("stage") stage: string) {
    const lowerStage = stage.toLowerCase() as MatchStage;
    if (!VALID_STAGES.includes(lowerStage)) {
      throw new BadRequestException(
        `Fase inválida. Valores permitidos: ${VALID_STAGES.join(", ")}`
      );
    }
    return this.matchesService.findByStage(lowerStage);
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.matchesService.findById(id);
  }

  @Patch(":id/result")
  @UseGuards(AdminGuard)
  async updateResult(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateResultDto
  ) {
    const match = await this.matchesService.updateResult(
      id,
      dto.homeScore,
      dto.awayScore,
      dto.homePenalty,
      dto.awayPenalty
    );
    await this.predictionsService.calculatePoints(id);
    return match;
  }
}
