import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Prediction } from "../predictions/entities/prediction.entity";
import { PoolMember } from "../pools/entities/pool-member.entity";
import { Pool } from "../pools/entities/pool.entity";

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
    private readonly predictionsRepo: Repository<Prediction>,
    @InjectRepository(PoolMember)
    private readonly poolMembersRepo: Repository<PoolMember>,
    @InjectRepository(Pool)
    private readonly poolsRepo: Repository<Pool>
  ) {}

  async getLeaderboard(knockout?: boolean): Promise<LeaderboardEntry[]> {
    const qb = this.predictionsRepo
      .createQueryBuilder("p")
      .innerJoin("p.user", "u")
      .innerJoin("p.match", "m")
      .select("u.id", "userId")
      .addSelect("u.name", "name")
      .addSelect("SUM(p.points)", "totalPoints")
      .addSelect("COUNT(p.id)", "totalPredictions")
      .addSelect(
        "SUM(CASE WHEN p.points = 10 THEN 1 ELSE 0 END)",
        "exactScores"
      );

    if (knockout) {
      qb.where("m.stage != :group", { group: "group" });
    }

    const results = await qb
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

  async getLeaderboardByPool(poolId: number): Promise<LeaderboardEntry[]> {
    const pool = await this.poolsRepo.findOne({ where: { id: poolId } });
    const knockout = pool?.knockoutOnly ?? false;

    const members = await this.poolMembersRepo.find({
      where: { poolId },
    });

    if (members.length === 0) return [];

    const memberUserIds = members.map((m) => m.userId);

    const qb = this.predictionsRepo
      .createQueryBuilder("p")
      .innerJoin("p.user", "u")
      .innerJoin("p.match", "m")
      .where("u.id IN (:...userIds)", { userIds: memberUserIds })
      .select("u.id", "userId")
      .addSelect("u.name", "name")
      .addSelect("SUM(p.points)", "totalPoints")
      .addSelect("COUNT(p.id)", "totalPredictions")
      .addSelect(
        "SUM(CASE WHEN p.points = 10 THEN 1 ELSE 0 END)",
        "exactScores"
      );

    if (knockout) {
      qb.andWhere("m.stage != :group", { group: "group" });
    }

    const results = await qb
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
