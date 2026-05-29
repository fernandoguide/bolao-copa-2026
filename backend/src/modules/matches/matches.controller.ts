import { Controller, Get, Param, Patch, Body, UseGuards } from "@nestjs/common";
import { MatchesService } from "./matches.service";
import { MatchStage } from "./entities/match.entity";
import { UpdateResultDto } from "./dto/update-result.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("matches")
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

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
  async updateResult(@Param("id") id: number, @Body() dto: UpdateResultDto) {
    return this.matchesService.updateResult(id, dto.homeScore, dto.awayScore);
  }
}
