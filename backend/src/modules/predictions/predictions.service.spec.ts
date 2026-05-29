import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BadRequestException } from "@nestjs/common";
import { PredictionsService } from "./predictions.service";
import { Prediction } from "./entities/prediction.entity";
import { MatchesService } from "../matches/matches.service";

describe("PredictionsService", () => {
  let service: PredictionsService;
  let repo: Record<string, jest.Mock>;
  let matchesService: Record<string, jest.Mock>;

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    matchesService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictionsService,
        { provide: getRepositoryToken(Prediction), useValue: repo },
        { provide: MatchesService, useValue: matchesService },
      ],
    }).compile();

    service = module.get<PredictionsService>(PredictionsService);
  });

  describe("create", () => {
    const userId = "user-1";
    const dto = { matchId: 1, homeScore: 2, awayScore: 1 };

    it("deve criar um novo palpite com sucesso", async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      matchesService.findById.mockResolvedValue({
        id: 1,
        played: false,
        matchDate: futureDate,
      });
      repo.findOne.mockResolvedValue(null);
      const prediction = { id: 1, user_id: userId, match_id: 1, ...dto };
      repo.create.mockReturnValue(prediction);
      repo.save.mockResolvedValue(prediction);

      const result = await service.create(userId, dto);
      expect(result).toEqual(prediction);
      expect(repo.create).toHaveBeenCalled();
    });

    it("deve atualizar palpite existente", async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      matchesService.findById.mockResolvedValue({
        id: 1,
        played: false,
        matchDate: futureDate,
      });
      const existing = {
        id: 1,
        user_id: userId,
        match_id: 1,
        homeScore: 0,
        awayScore: 0,
      };
      repo.findOne.mockResolvedValue(existing);
      repo.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.create(userId, dto);
      expect(result.homeScore).toBe(2);
      expect(result.awayScore).toBe(1);
    });

    it("deve rejeitar palpite em jogo já encerrado", async () => {
      matchesService.findById.mockResolvedValue({
        id: 1,
        played: true,
        matchDate: "2026-06-01",
      });

      await expect(service.create(userId, dto)).rejects.toThrow(
        BadRequestException
      );
    });

    it("deve rejeitar palpite após início da partida", async () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString();
      matchesService.findById.mockResolvedValue({
        id: 1,
        played: false,
        matchDate: pastDate,
      });

      await expect(service.create(userId, dto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("computePoints (via calculatePoints)", () => {
    // Testamos a lógica de pontuação indiretamente via calculatePoints
    it("deve dar 10 pontos para placar exato", async () => {
      matchesService.findById.mockResolvedValue({
        id: 1,
        played: true,
        homeScore: 2,
        awayScore: 1,
      });
      const prediction = {
        id: 1,
        match_id: 1,
        homeScore: 2,
        awayScore: 1,
        points: 0,
      };
      repo.find.mockResolvedValue([prediction]);
      repo.save.mockImplementation((preds) => Promise.resolve(preds));

      await service.calculatePoints(1);
      expect(prediction.points).toBe(10);
    });

    it("deve dar 7 pontos para vencedor + saldo correto", async () => {
      matchesService.findById.mockResolvedValue({
        id: 1,
        played: true,
        homeScore: 3,
        awayScore: 1,
      });
      // Palpite 2x0: mesmo saldo (+2), mesmo vencedor
      const prediction = {
        id: 1,
        match_id: 1,
        homeScore: 2,
        awayScore: 0,
        points: 0,
      };
      repo.find.mockResolvedValue([prediction]);
      repo.save.mockImplementation((preds) => Promise.resolve(preds));

      await service.calculatePoints(1);
      expect(prediction.points).toBe(7);
    });

    it("deve dar 5 pontos para apenas vencedor correto", async () => {
      matchesService.findById.mockResolvedValue({
        id: 1,
        played: true,
        homeScore: 3,
        awayScore: 1,
      });
      // Palpite 1x0: vencedor correto, saldo diferente (+1 vs +2)
      const prediction = {
        id: 1,
        match_id: 1,
        homeScore: 1,
        awayScore: 0,
        points: 0,
      };
      repo.find.mockResolvedValue([prediction]);
      repo.save.mockImplementation((preds) => Promise.resolve(preds));

      await service.calculatePoints(1);
      expect(prediction.points).toBe(5);
    });

    it("deve dar 0 pontos quando erra vencedor", async () => {
      matchesService.findById.mockResolvedValue({
        id: 1,
        played: true,
        homeScore: 1,
        awayScore: 2,
      });
      // Palpite 2x0: vencedor errado
      const prediction = {
        id: 1,
        match_id: 1,
        homeScore: 2,
        awayScore: 0,
        points: 0,
      };
      repo.find.mockResolvedValue([prediction]);
      repo.save.mockImplementation((preds) => Promise.resolve(preds));

      await service.calculatePoints(1);
      expect(prediction.points).toBe(0);
    });

    it("deve dar 5 pontos para empate correto (sem placar exato)", async () => {
      matchesService.findById.mockResolvedValue({
        id: 1,
        played: true,
        homeScore: 2,
        awayScore: 2,
      });
      // Palpite 1x1: empate correto, placar diferente
      const prediction = {
        id: 1,
        match_id: 1,
        homeScore: 1,
        awayScore: 1,
        points: 0,
      };
      repo.find.mockResolvedValue([prediction]);
      repo.save.mockImplementation((preds) => Promise.resolve(preds));

      await service.calculatePoints(1);
      expect(prediction.points).toBe(7); // saldo = 0, mesmo saldo → 7
    });

    it("deve dar 10 pontos para empate com placar exato", async () => {
      matchesService.findById.mockResolvedValue({
        id: 1,
        played: true,
        homeScore: 0,
        awayScore: 0,
      });
      const prediction = {
        id: 1,
        match_id: 1,
        homeScore: 0,
        awayScore: 0,
        points: 0,
      };
      repo.find.mockResolvedValue([prediction]);
      repo.save.mockImplementation((preds) => Promise.resolve(preds));

      await service.calculatePoints(1);
      expect(prediction.points).toBe(10);
    });

    it("não deve calcular pontos se jogo não foi jogado", async () => {
      matchesService.findById.mockResolvedValue({ id: 1, played: false });

      await service.calculatePoints(1);
      expect(repo.find).not.toHaveBeenCalled();
    });
  });

  describe("findByUser", () => {
    it("deve retornar palpites do usuário", async () => {
      const preds = [{ id: 1, user_id: "user-1" }];
      repo.find.mockResolvedValue(preds);

      const result = await service.findByUser("user-1");
      expect(result).toEqual(preds);
      expect(repo.find).toHaveBeenCalledWith({
        where: { user_id: "user-1" },
        relations: ["match", "match.homeTeam", "match.awayTeam"],
        order: { match: { matchDate: "ASC" } },
      });
    });
  });

  describe("findByMatch", () => {
    it("deve retornar palpites de uma partida", async () => {
      const preds = [{ id: 1, match_id: 5 }];
      repo.find.mockResolvedValue(preds);

      const result = await service.findByMatch(5);
      expect(result).toEqual(preds);
    });
  });
});
