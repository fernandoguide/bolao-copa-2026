import {
  Injectable,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Prediction } from "./entities/prediction.entity";
import { MatchesService } from "../matches/matches.service";
import { CreatePredictionDto } from "./dto/create-prediction.dto";

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(Prediction)
    private readonly predictionsRepo: Repository<Prediction>,
    @Inject(forwardRef(() => MatchesService))
    private readonly matchesService: MatchesService
  ) {}

  async create(userId: string, dto: CreatePredictionDto): Promise<Prediction> {
    const match = await this.matchesService.findById(dto.matchId);

    if (match.played) {
      throw new BadRequestException(
        "Não é possível palpitar em jogo já encerrado"
      );
    }

    if (new Date() >= new Date(match.matchDate)) {
      throw new BadRequestException(
        "Prazo para palpitar nesta partida encerrado"
      );
    }

    const existing = await this.predictionsRepo.findOne({
      where: { user_id: userId, match_id: dto.matchId },
    });

    if (existing) {
      existing.homeScore = dto.homeScore;
      existing.awayScore = dto.awayScore;
      return this.predictionsRepo.save(existing);
    }

    const prediction = this.predictionsRepo.create({
      user_id: userId,
      match_id: dto.matchId,
      homeScore: dto.homeScore,
      awayScore: dto.awayScore,
    });

    return this.predictionsRepo.save(prediction);
  }

  async findAll(): Promise<Prediction[]> {
    return this.predictionsRepo.find({
      relations: ["user", "match", "match.homeTeam", "match.awayTeam"],
      order: { user_id: "ASC", match: { matchDate: "ASC" } },
    });
  }

  async findAllFiltered(
    currentUserId: string,
    role: string
  ): Promise<Prediction[]> {
    const all = await this.predictionsRepo.find({
      relations: ["user", "match", "match.homeTeam", "match.awayTeam"],
      order: { user_id: "ASC", match: { matchDate: "ASC" } },
    });

    // Admin sees everything
    if (role === "admin") return all;

    const now = new Date();
    return all.filter((pred) => {
      // Always show own predictions
      if (pred.user_id === currentUserId) return true;
      // Show others' predictions only if match has started
      return new Date(pred.match.matchDate) <= now;
    });
  }

  async findByUser(userId: string): Promise<Prediction[]> {
    return this.predictionsRepo.find({
      where: { user_id: userId },
      relations: ["match", "match.homeTeam", "match.awayTeam"],
      order: { match: { matchDate: "ASC" } },
    });
  }

  async findByMatch(matchId: number): Promise<Prediction[]> {
    return this.predictionsRepo.find({
      where: { match_id: matchId },
      relations: ["user"],
    });
  }

  async calculatePoints(matchId: number): Promise<void> {
    const match = await this.matchesService.findById(matchId);
    if (!match.played) return;

    const predictions = await this.predictionsRepo.find({
      where: { match_id: matchId },
    });

    for (const prediction of predictions) {
      prediction.points = this.computePoints(
        prediction.homeScore,
        prediction.awayScore,
        match.homeScore,
        match.awayScore
      );
    }

    await this.predictionsRepo.save(predictions);
  }

  private computePoints(
    predHome: number,
    predAway: number,
    realHome: number,
    realAway: number
  ): number {
    // Placar exato
    if (predHome === realHome && predAway === realAway) {
      return 10;
    }

    const predDiff = predHome - predAway;
    const realDiff = realHome - realAway;

    // Vencedor correto + saldo correto
    if (predDiff === realDiff && Math.sign(predDiff) === Math.sign(realDiff)) {
      return 7;
    }

    // Vencedor correto (ou empate correto)
    if (Math.sign(predDiff) === Math.sign(realDiff)) {
      return 5;
    }

    return 0;
  }
}
