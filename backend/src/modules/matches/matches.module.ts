import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Match } from "./entities/match.entity";
import { MatchesService } from "./matches.service";
import { MatchesController } from "./matches.controller";
import { PredictionsModule } from "../predictions/predictions.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
    forwardRef(() => PredictionsModule),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
