import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { MatchesService } from "./matches.service";
import { Match, MatchStage } from "./entities/match.entity";

describe("MatchesService", () => {
  let service: MatchesService;
  let repo: Record<string, jest.Mock>;

  const mockMatch: Partial<Match> = {
    id: 1,
    homeScore: null as any,
    awayScore: null as any,
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
      expect(repo.find).toHaveBeenCalledWith({ order: { matchDate: "ASC" } });
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

  describe("updateResult", () => {
    it("deve atualizar o resultado e marcar como jogada", async () => {
      const match = { ...mockMatch };
      repo.findOne.mockResolvedValue(match);
      repo.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.updateResult(1, 2, 1);
      expect(result.homeScore).toBe(2);
      expect(result.awayScore).toBe(1);
      expect(result.played).toBe(true);
    });
  });
});
