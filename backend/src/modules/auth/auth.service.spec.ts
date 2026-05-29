import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

jest.mock("bcrypt");

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue("fake-jwt-token"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe("register", () => {
    const dto = { name: "João", email: "joao@test.com", password: "123456" };

    it("deve registrar um novo usuário com sucesso", async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      usersService.create!.mockResolvedValue({
        id: "uuid-1",
        name: dto.name,
        email: dto.email,
        password: "hashed-password",
      });

      const result = await authService.register(dto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(usersService.create).toHaveBeenCalledWith({
        name: dto.name,
        email: dto.email,
        password: "hashed-password",
      });
      expect(result.access_token).toBe("fake-jwt-token");
      expect(result.user.email).toBe(dto.email);
    });

    it("deve lançar ConflictException se email já existe", async () => {
      usersService.findByEmail!.mockResolvedValue({ id: "existing" });

      await expect(authService.register(dto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("login", () => {
    const dto = { email: "joao@test.com", password: "123456" };
    const user = {
      id: "uuid-1",
      name: "João",
      email: dto.email,
      password: "hashed",
    };

    it("deve fazer login com credenciais válidas", async () => {
      usersService.findByEmail!.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(dto);

      expect(result.access_token).toBe("fake-jwt-token");
      expect(result.user.id).toBe(user.id);
    });

    it("deve lançar UnauthorizedException se email não existe", async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("deve lançar UnauthorizedException se senha está errada", async () => {
      usersService.findByEmail!.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
