import { Test, TestingModule } from "@nestjs/testing";
import { MatchesController } from "./matches.controller";
import { MatchesService } from "./matches.service";
import { PredictionsService } from "../predictions/predictions.service";
import { MatchStage } from "./entities/match.entity";

describe("MatchesController", () => {
  let controller: MatchesController;
  let matchesService: Record<string, jest.Mock>;
  let predictionsService: Record<string, jest.Mock>;

  const mockMatch = {
    id: 1,
    homeTeam: { name: "Brasil" },
    awayTeam: { name: "Argentina" },
    stage: MatchStage.GROUP,
    played: false,
  };

  beforeEach(async () => {
    matchesService = {
      findAll: jest.fn().mockResolvedValue([mockMatch]),
      findById: jest.fn().mockResolvedValue(mockMatch),
      findByStage: jest.fn().mockResolvedValue([mockMatch]),
      findUpcoming: jest.fn().mockResolvedValue([mockMatch]),
      updateResult: jest.fn().mockResolvedValue({
        ...mockMatch,
        homeScore: 2,
        awayScore: 0,
        homePenalty: null,
        awayPenalty: null,
        played: true,
      }),
    };

    predictionsService = {
      calculatePoints: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        { provide: MatchesService, useValue: matchesService },
        { provide: PredictionsService, useValue: predictionsService },
      ],
    }).compile();

    controller = module.get<MatchesController>(MatchesController);
  });

  it("GET /matches deve retornar todas as partidas", async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockMatch]);
  });

  it("GET /matches/upcoming deve retornar próximas partidas", async () => {
    const result = await controller.findUpcoming();
    expect(result).toEqual([mockMatch]);
  });

  it("GET /matches/stage/:stage deve retornar por fase", async () => {
    const result = await controller.findByStage("GROUP");
    expect(result).toEqual([mockMatch]);
    expect(matchesService.findByStage).toHaveBeenCalledWith(MatchStage.GROUP);
  });

  it("GET /matches/:id deve retornar uma partida", async () => {
    const result = await controller.findOne(1);
    expect(result).toEqual(mockMatch);
  });

  it("PATCH /matches/:id/result deve atualizar resultado sem pênaltis", async () => {
    const result = await controller.updateResult(1, {
      homeScore: 2,
      awayScore: 0,
    });
    expect(result.played).toBe(true);
    expect(matchesService.updateResult).toHaveBeenCalledWith(
      1,
      2,
      0,
      undefined,
      undefined
    );
  });

  it("PATCH /matches/:id/result deve passar pênaltis ao service", async () => {
    matchesService.updateResult.mockResolvedValue({
      ...mockMatch,
      homeScore: 1,
      awayScore: 1,
      homePenalty: 5,
      awayPenalty: 3,
      played: true,
    });

    const result = await controller.updateResult(1, {
      homeScore: 1,
      awayScore: 1,
      homePenalty: 5,
      awayPenalty: 3,
    });

    expect(result.homePenalty).toBe(5);
    expect(result.awayPenalty).toBe(3);
    expect(matchesService.updateResult).toHaveBeenCalledWith(1, 1, 1, 5, 3);
  });

  it("PATCH /matches/:id/result deve calcular pontos após salvar", async () => {
    await controller.updateResult(1, { homeScore: 2, awayScore: 0 });
    expect(predictionsService.calculatePoints).toHaveBeenCalledWith(1);
  });
});
