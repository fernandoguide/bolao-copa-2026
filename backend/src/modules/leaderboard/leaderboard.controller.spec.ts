import { Test, TestingModule } from "@nestjs/testing";
import { LeaderboardController } from "./leaderboard.controller";
import { LeaderboardService } from "./leaderboard.service";

describe("LeaderboardController", () => {
  let controller: LeaderboardController;
  let leaderboardService: Record<string, jest.Mock>;

  beforeEach(async () => {
    leaderboardService = {
      getLeaderboard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaderboardController],
      providers: [
        { provide: LeaderboardService, useValue: leaderboardService },
      ],
    }).compile();

    controller = module.get<LeaderboardController>(LeaderboardController);
  });

  it("GET /leaderboard deve retornar o ranking", async () => {
    const ranking = [
      {
        userId: "u1",
        name: "Alice",
        totalPoints: 30,
        totalPredictions: 5,
        exactScores: 2,
      },
      {
        userId: "u2",
        name: "Bob",
        totalPoints: 15,
        totalPredictions: 5,
        exactScores: 0,
      },
    ];
    leaderboardService.getLeaderboard.mockResolvedValue(ranking);

    const result = await controller.getLeaderboard();
    expect(result).toEqual(ranking);
  });
});
