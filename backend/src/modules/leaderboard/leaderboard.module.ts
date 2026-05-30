import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Prediction } from "../predictions/entities/prediction.entity";
import { PoolMember } from "../pools/entities/pool-member.entity";
import { LeaderboardService } from "./leaderboard.service";
import { LeaderboardController } from "./leaderboard.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Prediction, PoolMember])],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
