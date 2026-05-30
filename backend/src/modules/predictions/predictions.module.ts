import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Prediction } from "./entities/prediction.entity";
import { PredictionsService } from "./predictions.service";
import { PredictionsController } from "./predictions.controller";
import { MatchesModule } from "../matches/matches.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Prediction]),
    forwardRef(() => MatchesModule),
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
