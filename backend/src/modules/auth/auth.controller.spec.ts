import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: Record<string, jest.Mock>;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe("POST /auth/register", () => {
    it("deve chamar authService.register e retornar resultado", async () => {
      const dto = { name: "Test", email: "test@test.com", password: "123456" };
      const expected = {
        access_token: "token",
        user: { id: "1", name: "Test", email: "test@test.com" },
      };
      authService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);
      expect(result).toEqual(expected);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe("POST /auth/login", () => {
    it("deve chamar authService.login e retornar resultado", async () => {
      const dto = { email: "test@test.com", password: "123456" };
      const expected = {
        access_token: "token",
        user: { id: "1", name: "Test", email: "test@test.com" },
      };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);
      expect(result).toEqual(expected);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });
});
