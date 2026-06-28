import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { LeaderboardService } from "./leaderboard.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("leaderboard")
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(@Query("knockout") knockout?: string) {
    return this.leaderboardService.getLeaderboard(knockout === "true");
  }

  @Get("pool/:poolId")
  async getLeaderboardByPool(@Param("poolId", ParseIntPipe) poolId: number) {
    return this.leaderboardService.getLeaderboardByPool(poolId);
  }
}
