import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";

describe("UsersService", () => {
  let service: UsersService;
  let repo: Record<string, jest.Mock>;

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe("findByEmail", () => {
    it("deve retornar o usuário quando encontrado", async () => {
      const user = { id: "1", email: "test@test.com" };
      repo.findOne.mockResolvedValue(user);

      const result = await service.findByEmail("test@test.com");
      expect(result).toEqual(user);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: "test@test.com" },
      });
    });

    it("deve retornar null quando não encontrado", async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.findByEmail("naoexiste@test.com");
      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("deve retornar o usuário pelo id", async () => {
      const user = { id: "uuid-1", name: "Test" };
      repo.findOne.mockResolvedValue(user);

      const result = await service.findById("uuid-1");
      expect(result).toEqual(user);
    });
  });

  describe("create", () => {
    it("deve criar e salvar um novo usuário", async () => {
      const data = { name: "Novo", email: "novo@test.com", password: "hash" };
      const created = { id: "uuid-2", ...data };
      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);

      const result = await service.create(data);
      expect(repo.create).toHaveBeenCalledWith(data);
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe("findAll", () => {
    it("deve retornar lista de usuários sem password", async () => {
      const users = [
        { id: "1", name: "A", email: "a@a.com", createdAt: new Date() },
      ];
      repo.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(repo.find).toHaveBeenCalledWith({
        select: ["id", "name", "email", "createdAt"],
      });
    });
  });
});
