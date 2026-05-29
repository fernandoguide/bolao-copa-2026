import { Test, TestingModule } from "@nestjs/testing";
import { PredictionsController } from "./predictions.controller";
import { PredictionsService } from "./predictions.service";

describe("PredictionsController", () => {
  let controller: PredictionsController;
  let predictionsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    predictionsService = {
      create: jest.fn(),
      findByUser: jest.fn(),
      findByMatch: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PredictionsController],
      providers: [
        { provide: PredictionsService, useValue: predictionsService },
      ],
    }).compile();

    controller = module.get<PredictionsController>(PredictionsController);
  });

  it("POST /predictions deve criar um palpite", async () => {
    const req = { user: { id: "user-1" } } as any;
    const dto = { matchId: 1, homeScore: 2, awayScore: 1 };
    const expected = { id: 1, ...dto, user_id: "user-1" };
    predictionsService.create.mockResolvedValue(expected);

    const result = await controller.create(req, dto);
    expect(result).toEqual(expected);
    expect(predictionsService.create).toHaveBeenCalledWith("user-1", dto);
  });

  it("GET /predictions/my deve retornar palpites do usuário", async () => {
    const req = { user: { id: "user-1" } } as any;
    const preds = [{ id: 1, user_id: "user-1" }];
    predictionsService.findByUser.mockResolvedValue(preds);

    const result = await controller.findMine(req);
    expect(result).toEqual(preds);
  });

  it("GET /predictions/match/:matchId deve retornar palpites da partida", async () => {
    const preds = [{ id: 1, match_id: 5 }];
    predictionsService.findByMatch.mockResolvedValue(preds);

    const result = await controller.findByMatch(5);
    expect(result).toEqual(preds);
  });
});
