import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { TeamsService } from "./teams.service";
import { Team } from "./entities/team.entity";

describe("TeamsService", () => {
  let service: TeamsService;
  let repo: Record<string, jest.Mock>;

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: getRepositoryToken(Team), useValue: repo },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  describe("findAll", () => {
    it("deve retornar todas as seleções ordenadas", async () => {
      const teams = [
        { id: 1, name: "Argentina", code: "ARG", group: "D" },
        { id: 2, name: "Brasil", code: "BRA", group: "E" },
      ];
      repo.find.mockResolvedValue(teams);

      const result = await service.findAll();
      expect(result).toEqual(teams);
      expect(repo.find).toHaveBeenCalledWith({
        order: { group: "ASC", name: "ASC" },
      });
    });
  });

  describe("findByGroup", () => {
    it("deve retornar seleções de um grupo específico", async () => {
      const teams = [{ id: 1, name: "Brasil", code: "BRA", group: "E" }];
      repo.find.mockResolvedValue(teams);

      const result = await service.findByGroup("E");
      expect(result).toEqual(teams);
      expect(repo.find).toHaveBeenCalledWith({
        where: { group: "E" },
        order: { name: "ASC" },
      });
    });
  });

  describe("findById", () => {
    it("deve retornar a seleção pelo id", async () => {
      const team = { id: 1, name: "Brasil", code: "BRA" };
      repo.findOne.mockResolvedValue(team);

      const result = await service.findById(1);
      expect(result).toEqual(team);
    });

    it("deve retornar null se não encontrar", async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.findById(999);
      expect(result).toBeNull();
    });
  });
});
