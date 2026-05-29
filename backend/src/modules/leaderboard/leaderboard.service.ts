import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Prediction } from "../predictions/entities/prediction.entity";

export interface LeaderboardEntry {
  userId: string;
  name: string;
  totalPoints: number;
  totalPredictions: number;
  exactScores: number;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Prediction)
    private readonly predictionsRepo: Repository<Prediction>
  ) {}

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const results = await this.predictionsRepo
      .createQueryBuilder("p")
      .innerJoin("p.user", "u")
      .select("u.id", "userId")
      .addSelect("u.name", "name")
      .addSelect("SUM(p.points)", "totalPoints")
      .addSelect("COUNT(p.id)", "totalPredictions")
      .addSelect(
        "SUM(CASE WHEN p.points = 10 THEN 1 ELSE 0 END)",
        "exactScores"
      )
      .groupBy("u.id")
      .addGroupBy("u.name")
      .orderBy('"totalPoints"', "DESC")
      .getRawMany();

    return results.map((r) => ({
      userId: r.userId,
      name: r.name,
      totalPoints: Number(r.totalPoints) || 0,
      totalPredictions: Number(r.totalPredictions) || 0,
      exactScores: Number(r.exactScores) || 0,
    }));
  }
}
