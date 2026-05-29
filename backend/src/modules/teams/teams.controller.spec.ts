import { Test, TestingModule } from "@nestjs/testing";
import { TeamsController } from "./teams.controller";
import { TeamsService } from "./teams.service";

describe("TeamsController", () => {
  let controller: TeamsController;
  let teamsService: Record<string, jest.Mock>;

  const mockTeams = [
    { id: 1, name: "Brasil", code: "BRA", group: "E" },
    { id: 2, name: "Argentina", code: "ARG", group: "D" },
  ];

  beforeEach(async () => {
    teamsService = {
      findAll: jest.fn().mockResolvedValue(mockTeams),
      findByGroup: jest.fn().mockResolvedValue([mockTeams[0]]),
      findById: jest.fn().mockResolvedValue(mockTeams[0]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [{ provide: TeamsService, useValue: teamsService }],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
  });

  it("GET /teams deve retornar todas as seleções", async () => {
    const result = await controller.findAll();
    expect(result).toEqual(mockTeams);
  });

  it("GET /teams/group/:group deve retornar seleções do grupo", async () => {
    const result = await controller.findByGroup("e");
    expect(result).toEqual([mockTeams[0]]);
    expect(teamsService.findByGroup).toHaveBeenCalledWith("E");
  });

  it("GET /teams/:id deve retornar uma seleção", async () => {
    const result = await controller.findOne(1);
    expect(result).toEqual(mockTeams[0]);
  });
});
