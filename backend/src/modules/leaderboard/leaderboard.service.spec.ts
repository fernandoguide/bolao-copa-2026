import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { LeaderboardService } from "./leaderboard.service";
import { Prediction } from "../predictions/entities/prediction.entity";

describe("LeaderboardService", () => {
  let service: LeaderboardService;

  const mockQueryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const repo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        { provide: getRepositoryToken(Prediction), useValue: repo },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
  });

  describe("getLeaderboard", () => {
    it("deve retornar o ranking ordenado por pontos", async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          userId: "u1",
          name: "Alice",
          totalPoints: "25",
          totalPredictions: "5",
          exactScores: "1",
        },
        {
          userId: "u2",
          name: "Bob",
          totalPoints: "15",
          totalPredictions: "5",
          exactScores: "0",
        },
      ]);

      const result = await service.getLeaderboard();

      expect(result).toEqual([
        {
          userId: "u1",
          name: "Alice",
          totalPoints: 25,
          totalPredictions: 5,
          exactScores: 1,
        },
        {
          userId: "u2",
          name: "Bob",
          totalPoints: 15,
          totalPredictions: 5,
          exactScores: 0,
        },
      ]);
    });

    it("deve retornar lista vazia quando não há palpites", async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getLeaderboard();
      expect(result).toEqual([]);
    });

    it("deve converter valores null para 0", async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        {
          userId: "u1",
          name: "Carlos",
          totalPoints: null,
          totalPredictions: "3",
          exactScores: null,
        },
      ]);

      const result = await service.getLeaderboard();
      expect(result[0].totalPoints).toBe(0);
      expect(result[0].exactScores).toBe(0);
    });
  });
});
