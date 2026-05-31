import {
  Controller,
  Get,
  Param,
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
  async getLeaderboard() {
    return this.leaderboardService.getLeaderboard();
  }

  @Get("pool/:poolId")
  async getLeaderboardByPool(@Param("poolId", ParseIntPipe) poolId: number) {
    return this.leaderboardService.getLeaderboardByPool(poolId);
  }
}
