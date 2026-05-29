import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Match, MatchStage } from "./entities/match.entity";

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchesRepo: Repository<Match>
  ) {}

  async findAll(): Promise<Match[]> {
    return this.matchesRepo.find({ order: { matchDate: "ASC" } });
  }

  async findById(id: number): Promise<Match> {
    const match = await this.matchesRepo.findOne({ where: { id } });
    if (!match) throw new NotFoundException("Partida não encontrada");
    return match;
  }

  async findByStage(stage: MatchStage): Promise<Match[]> {
    return this.matchesRepo.find({
      where: { stage },
      order: { matchDate: "ASC" },
    });
  }

  async findUpcoming(): Promise<Match[]> {
    return this.matchesRepo
      .createQueryBuilder("match")
      .where("match.played = false")
      .orderBy("match.matchDate", "ASC")
      .getMany();
  }

  async updateResult(
    id: number,
    homeScore: number,
    awayScore: number
  ): Promise<Match> {
    const match = await this.findById(id);
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.played = true;
    return this.matchesRepo.save(match);
  }
}
