import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Match, MatchStage } from "./entities/match.entity";
import { Team } from "../teams/entities/team.entity";

/**
 * Mapa do chaveamento da Copa 2026.
 * Chave = label da partida atual.
 * Valor = { nextLabel: label da próxima partida, position: 'home' | 'away' }
 */
const WINNER_ADVANCES: Record<
  string,
  { nextLabel: string; position: "home" | "away" }
> = {
  // 16 avos → Oitavas
  "Jogo 73": { nextLabel: "Jogo 90", position: "home" },
  "Jogo 74": { nextLabel: "Jogo 89", position: "home" },
  "Jogo 75": { nextLabel: "Jogo 90", position: "away" },
  "Jogo 76": { nextLabel: "Jogo 91", position: "home" },
  "Jogo 77": { nextLabel: "Jogo 89", position: "away" },
  "Jogo 78": { nextLabel: "Jogo 91", position: "away" },
  "Jogo 79": { nextLabel: "Jogo 92", position: "home" },
  "Jogo 80": { nextLabel: "Jogo 92", position: "away" },
  "Jogo 81": { nextLabel: "Jogo 94", position: "home" },
  "Jogo 82": { nextLabel: "Jogo 94", position: "away" },
  "Jogo 83": { nextLabel: "Jogo 93", position: "home" },
  "Jogo 84": { nextLabel: "Jogo 93", position: "away" },
  "Jogo 85": { nextLabel: "Jogo 96", position: "home" },
  "Jogo 86": { nextLabel: "Jogo 95", position: "home" },
  "Jogo 87": { nextLabel: "Jogo 96", position: "away" },
  "Jogo 88": { nextLabel: "Jogo 95", position: "away" },
  // Oitavas → Quartas
  "Jogo 89": { nextLabel: "Jogo 97", position: "home" },
  "Jogo 90": { nextLabel: "Jogo 97", position: "away" },
  "Jogo 91": { nextLabel: "Jogo 99", position: "home" },
  "Jogo 92": { nextLabel: "Jogo 99", position: "away" },
  "Jogo 93": { nextLabel: "Jogo 98", position: "home" },
  "Jogo 94": { nextLabel: "Jogo 98", position: "away" },
  "Jogo 95": { nextLabel: "Jogo 100", position: "home" },
  "Jogo 96": { nextLabel: "Jogo 100", position: "away" },
  // Quartas → Semis
  "Jogo 97": { nextLabel: "Jogo 101", position: "home" },
  "Jogo 98": { nextLabel: "Jogo 101", position: "away" },
  "Jogo 99": { nextLabel: "Jogo 102", position: "home" },
  "Jogo 100": { nextLabel: "Jogo 102", position: "away" },
  // Semis → Final
  "Jogo 101": { nextLabel: "Final", position: "home" },
  "Jogo 102": { nextLabel: "Final", position: "away" },
};

/** Perdedores das semifinais → disputa de 3º lugar */
const LOSER_ADVANCES: Record<
  string,
  { nextLabel: string; position: "home" | "away" }
> = {
  "Jogo 101": { nextLabel: "3º lugar", position: "home" },
  "Jogo 102": { nextLabel: "3º lugar", position: "away" },
};

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
    awayScore: number,
    homePenalty?: number,
    awayPenalty?: number
  ): Promise<Match> {
    const match = await this.findById(id);
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.played = true;

    const isKnockout = match.stage !== MatchStage.GROUP;

    if (isKnockout && homeScore === awayScore) {
      if (homePenalty == null || awayPenalty == null) {
        throw new BadRequestException(
          "Jogo de mata-mata empatado requer resultado dos pênaltis"
        );
      }
      if (homePenalty === awayPenalty) {
        throw new BadRequestException(
          "Resultado dos pênaltis não pode ser empate"
        );
      }
      match.homePenalty = homePenalty;
      match.awayPenalty = awayPenalty;
    } else {
      match.homePenalty = null;
      match.awayPenalty = null;
    }

    const saved = await this.matchesRepo.save(match);

    if (isKnockout) {
      await this.advanceTeams(saved);
    }

    return saved;
  }

  private getWinnerAndLoser(match: Match): {
    winner: Team | null;
    loser: Team | null;
  } {
    if (match.homeScore > match.awayScore) {
      return { winner: match.homeTeam, loser: match.awayTeam };
    }
    if (match.awayScore > match.homeScore) {
      return { winner: match.awayTeam, loser: match.homeTeam };
    }
    if (match.homePenalty != null && match.awayPenalty != null) {
      if (match.homePenalty > match.awayPenalty) {
        return { winner: match.homeTeam, loser: match.awayTeam };
      }
      return { winner: match.awayTeam, loser: match.homeTeam };
    }
    return { winner: null, loser: null };
  }

  private async advanceTeams(match: Match): Promise<void> {
    const { winner, loser } = this.getWinnerAndLoser(match);
    const label = match.matchLabel;
    if (!label) return;

    // Avança o vencedor
    const winnerTarget = WINNER_ADVANCES[label];
    if (winnerTarget && winner) {
      const nextMatch = await this.matchesRepo.findOne({
        where: { matchLabel: winnerTarget.nextLabel },
      });
      if (nextMatch) {
        if (winnerTarget.position === "home") {
          nextMatch.homeTeam = winner;
        } else {
          nextMatch.awayTeam = winner;
        }
        await this.matchesRepo.save(nextMatch);
      }
    }

    // Avança o perdedor (disputa de 3º lugar)
    const loserTarget = LOSER_ADVANCES[label];
    if (loserTarget && loser) {
      const nextMatch = await this.matchesRepo.findOne({
        where: { matchLabel: loserTarget.nextLabel },
      });
      if (nextMatch) {
        if (loserTarget.position === "home") {
          nextMatch.homeTeam = loser;
        } else {
          nextMatch.awayTeam = loser;
        }
        await this.matchesRepo.save(nextMatch);
      }
    }
  }
}
