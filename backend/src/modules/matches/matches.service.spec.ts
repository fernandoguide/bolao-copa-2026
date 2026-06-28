import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { MatchesService } from "./matches.service";
import { Match, MatchStage } from "./entities/match.entity";

describe("MatchesService", () => {
  let service: MatchesService;
  let repo: Record<string, jest.Mock>;

  const mockMatch: Partial<Match> = {
    id: 1,
    homeScore: null as any,
    awayScore: null as any,
    homePenalty: null as any,
    awayPenalty: null as any,
    played: false,
    stage: MatchStage.GROUP,
    matchDate: new Date("2026-06-11T18:00:00Z"),
  };

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        { provide: getRepositoryToken(Match), useValue: repo },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  describe("findAll", () => {
    it("deve retornar todas as partidas ordenadas por data", async () => {
      repo.find.mockResolvedValue([mockMatch]);
      const result = await service.findAll();
      expect(result).toEqual([mockMatch]);
      expect(repo.find).toHaveBeenCalledWith({
        order: { played: "ASC", matchDate: "ASC" },
      });
    });
  });

  describe("findById", () => {
    it("deve retornar a partida quando encontrada", async () => {
      repo.findOne.mockResolvedValue(mockMatch);
      const result = await service.findById(1);
      expect(result).toEqual(mockMatch);
    });

    it("deve lançar NotFoundException quando não encontrada", async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByStage", () => {
    it("deve retornar partidas por fase", async () => {
      repo.find.mockResolvedValue([mockMatch]);
      const result = await service.findByStage(MatchStage.GROUP);
      expect(result).toEqual([mockMatch]);
      expect(repo.find).toHaveBeenCalledWith({
        where: { stage: MatchStage.GROUP },
        order: { matchDate: "ASC" },
      });
    });
  });

  describe("findUpcoming", () => {
    it("deve retornar partidas não jogadas", async () => {
      const qb = repo.createQueryBuilder();
      qb.getMany.mockResolvedValue([mockMatch]);

      const result = await service.findUpcoming();
      expect(result).toEqual([mockMatch]);
    });
  });

  describe("updateResult - Fase de Grupos", () => {
    it("deve atualizar o resultado e marcar como jogada", async () => {
      const match = { ...mockMatch };
      repo.findOne.mockResolvedValue(match);
      repo.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.updateResult(1, 2, 1);
      expect(result.homeScore).toBe(2);
      expect(result.awayScore).toBe(1);
      expect(result.played).toBe(true);
      expect(result.homePenalty).toBeNull();
      expect(result.awayPenalty).toBeNull();
    });

    it("deve aceitar empate na fase de grupos sem pênaltis", async () => {
      const match = { ...mockMatch, stage: MatchStage.GROUP };
      repo.findOne.mockResolvedValue(match);
      repo.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.updateResult(1, 1, 1);
      expect(result.homeScore).toBe(1);
      expect(result.awayScore).toBe(1);
      expect(result.played).toBe(true);
      expect(result.homePenalty).toBeNull();
      expect(result.awayPenalty).toBeNull();
    });
  });

  describe("updateResult - Mata-mata (Knockout)", () => {
    const knockoutMatch: Partial<Match> = {
      id: 73,
      homeScore: null as any,
      awayScore: null as any,
      homePenalty: null as any,
      awayPenalty: null as any,
      played: false,
      stage: MatchStage.ROUND_OF_32,
      matchDate: new Date("2026-06-28T19:00:00Z"),
      matchLabel: "Jogo 73",
      homeTeam: {
        id: 1,
        name: "África do Sul",
        code: "RSA",
        group: "A",
      } as any,
      awayTeam: { id: 2, name: "Canadá", code: "CAN", group: "B" } as any,
    };

    it("deve aceitar vitória normal no mata-mata sem pênaltis", async () => {
      const match = { ...knockoutMatch };
      repo.findOne.mockImplementation(({ where }: any) => {
        if (where?.id) return Promise.resolve(match);
        if (where?.matchLabel === "Jogo 90")
          return Promise.resolve({
            id: 90,
            matchLabel: "Jogo 90",
            homeTeam: null,
            awayTeam: null,
          });
        return Promise.resolve(null);
      });
      repo.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.updateResult(73, 2, 1);
      expect(result.homeScore).toBe(2);
      expect(result.awayScore).toBe(1);
      expect(result.played).toBe(true);
      expect(result.homePenalty).toBeNull();
      expect(result.awayPenalty).toBeNull();
    });

    it("deve exigir pênaltis quando empate no mata-mata", async () => {
      const match = { ...knockoutMatch };
      repo.findOne.mockResolvedValue(match);

      await expect(service.updateResult(73, 1, 1)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.updateResult(73, 1, 1)).rejects.toThrow(
        "Jogo de mata-mata empatado requer resultado dos pênaltis"
      );
    });

    it("deve rejeitar pênaltis empatados", async () => {
      const match = { ...knockoutMatch };
      repo.findOne.mockResolvedValue(match);

      await expect(service.updateResult(73, 1, 1, 4, 4)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.updateResult(73, 1, 1, 4, 4)).rejects.toThrow(
        "Resultado dos pênaltis não pode ser empate"
      );
    });

    it("deve salvar resultado com pênaltis quando empate no mata-mata", async () => {
      const match = { ...knockoutMatch };
      repo.findOne.mockImplementation(({ where }: any) => {
        if (where?.id) return Promise.resolve(match);
        if (where?.matchLabel === "Jogo 90")
          return Promise.resolve({
            id: 90,
            matchLabel: "Jogo 90",
            homeTeam: null,
            awayTeam: null,
          });
        return Promise.resolve(null);
      });
      repo.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.updateResult(73, 1, 1, 5, 3);
      expect(result.homeScore).toBe(1);
      expect(result.awayScore).toBe(1);
      expect(result.homePenalty).toBe(5);
      expect(result.awayPenalty).toBe(3);
      expect(result.played).toBe(true);
    });

    it("deve funcionar com todos os stages de mata-mata", async () => {
      const stages = [
        MatchStage.ROUND_OF_32,
        MatchStage.ROUND_OF_16,
        MatchStage.QUARTER_FINAL,
        MatchStage.SEMI_FINAL,
        MatchStage.THIRD_PLACE,
        MatchStage.FINAL,
      ];

      for (const stage of stages) {
        const match = { ...knockoutMatch, stage, matchLabel: null };
        repo.findOne.mockResolvedValue(match);

        await expect(service.updateResult(73, 2, 2)).rejects.toThrow(
          BadRequestException
        );
      }
    });

    it("deve limpar pênaltis quando vitória normal após empate anterior", async () => {
      const match = { ...knockoutMatch, homePenalty: 5, awayPenalty: 3 };
      repo.findOne.mockImplementation(({ where }: any) => {
        if (where?.id) return Promise.resolve(match);
        if (where?.matchLabel === "Jogo 90")
          return Promise.resolve({
            id: 90,
            matchLabel: "Jogo 90",
            homeTeam: null,
            awayTeam: null,
          });
        return Promise.resolve(null);
      });
      repo.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.updateResult(73, 3, 1);
      expect(result.homePenalty).toBeNull();
      expect(result.awayPenalty).toBeNull();
    });
  });

  describe("Avanço de times no chaveamento", () => {
    const homeTeam = {
      id: 1,
      name: "Alemanha",
      code: "GER",
      group: "E",
    } as any;
    const awayTeam = {
      id: 2,
      name: "Paraguai",
      code: "PAR",
      group: "D",
    } as any;

    it("deve avançar o vencedor (homeTeam) para a próxima fase", async () => {
      const match = {
        id: 74,
        stage: MatchStage.ROUND_OF_32,
        matchLabel: "Jogo 74",
        homeTeam,
        awayTeam,
        homeScore: null,
        awayScore: null,
        homePenalty: null,
        awayPenalty: null,
        played: false,
      };
      const nextMatch = {
        id: 89,
        matchLabel: "Jogo 89",
        homeTeam: null,
        awayTeam: null,
      };

      repo.findOne.mockImplementation(({ where }: any) => {
        if (where?.id === 74) return Promise.resolve(match);
        if (where?.matchLabel === "Jogo 89") return Promise.resolve(nextMatch);
        return Promise.resolve(null);
      });
      repo.save.mockImplementation((m) => Promise.resolve(m));

      await service.updateResult(74, 3, 0);

      // O vencedor (homeTeam = Alemanha) deve ir para Jogo 89 como home
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 89,
          homeTeam,
        })
      );
    });

    it("deve avançar o vencedor (awayTeam) para a próxima fase", async () => {
      const match = {
        id: 74,
        stage: MatchStage.ROUND_OF_32,
        matchLabel: "Jogo 74",
        homeTeam,
        awayTeam,
        homeScore: null,
        awayScore: null,
        homePenalty: null,
        awayPenalty: null,
        played: false,
      };
      const nextMatch = {
        id: 89,
        matchLabel: "Jogo 89",
        homeTeam: null,
        awayTeam: null,
      };

      repo.findOne.mockImplementation(({ where }: any) => {
        if (where?.id === 74) return Promise.resolve(match);
        if (where?.matchLabel === "Jogo 89") return Promise.resolve(nextMatch);
        return Promise.resolve(null);
      });
      repo.save.mockImplementation((m) => Promise.resolve(m));

      await service.updateResult(74, 0, 2);

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 89,
          homeTeam: awayTeam,
        })
      );
    });

    it("deve avançar o vencedor nos pênaltis para a próxima fase", async () => {
      const match = {
        id: 74,
        stage: MatchStage.ROUND_OF_32,
        matchLabel: "Jogo 74",
        homeTeam,
        awayTeam,
        homeScore: null,
        awayScore: null,
        homePenalty: null,
        awayPenalty: null,
        played: false,
      };
      const nextMatch = {
        id: 89,
        matchLabel: "Jogo 89",
        homeTeam: null,
        awayTeam: null,
      };

      repo.findOne.mockImplementation(({ where }: any) => {
        if (where?.id === 74) return Promise.resolve(match);
        if (where?.matchLabel === "Jogo 89") return Promise.resolve(nextMatch);
        return Promise.resolve(null);
      });
      repo.save.mockImplementation((m) => Promise.resolve(m));

      // Empate 1x1, pênaltis 4x2 (homeTeam vence nos pênaltis)
      await service.updateResult(74, 1, 1, 4, 2);

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 89,
          homeTeam,
        })
      );
    });

    it("deve avançar perdedor da semifinal para disputa de 3º lugar", async () => {
      const match = {
        id: 101,
        stage: MatchStage.SEMI_FINAL,
        matchLabel: "Jogo 101",
        homeTeam,
        awayTeam,
        homeScore: null,
        awayScore: null,
        homePenalty: null,
        awayPenalty: null,
        played: false,
      };
      const finalMatch = {
        id: 103,
        matchLabel: "Final",
        homeTeam: null,
        awayTeam: null,
      };
      const thirdPlaceMatch = {
        id: 104,
        matchLabel: "3º lugar",
        homeTeam: null,
        awayTeam: null,
      };

      repo.findOne.mockImplementation(({ where }: any) => {
        if (where?.id === 101) return Promise.resolve(match);
        if (where?.matchLabel === "Final") return Promise.resolve(finalMatch);
        if (where?.matchLabel === "3º lugar")
          return Promise.resolve(thirdPlaceMatch);
        return Promise.resolve(null);
      });
      repo.save.mockImplementation((m) => Promise.resolve(m));

      await service.updateResult(101, 2, 0);

      // Vencedor (homeTeam) vai para Final como home
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 103,
          homeTeam,
        })
      );

      // Perdedor (awayTeam) vai para 3º lugar como home
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 104,
          homeTeam: awayTeam,
        })
      );
    });

    it("não deve avançar se matchLabel não existe no mapa", async () => {
      const match = {
        id: 50,
        stage: MatchStage.ROUND_OF_32,
        matchLabel: "Jogo Inexistente",
        homeTeam,
        awayTeam,
        homeScore: null,
        awayScore: null,
        homePenalty: null,
        awayPenalty: null,
        played: false,
      };

      repo.findOne.mockImplementation(({ where }: any) => {
        if (where?.id === 50) return Promise.resolve(match);
        return Promise.resolve(null);
      });
      repo.save.mockImplementation((m) => Promise.resolve(m));

      await service.updateResult(50, 2, 0);

      // save é chamado 1 vez (apenas para salvar o resultado do match atual)
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it("não deve avançar se matchLabel é null", async () => {
      const match = {
        id: 50,
        stage: MatchStage.ROUND_OF_32,
        matchLabel: null,
        homeTeam,
        awayTeam,
        homeScore: null,
        awayScore: null,
        homePenalty: null,
        awayPenalty: null,
        played: false,
      };

      repo.findOne.mockImplementation(({ where }: any) => {
        if (where?.id === 50) return Promise.resolve(match);
        return Promise.resolve(null);
      });
      repo.save.mockImplementation((m) => Promise.resolve(m));

      await service.updateResult(50, 2, 0);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });
  });
});
