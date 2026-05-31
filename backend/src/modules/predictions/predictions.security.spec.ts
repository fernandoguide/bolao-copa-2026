import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { PredictionsController } from "./predictions.controller";
import { PredictionsService } from "./predictions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

describe("Predictions Security Tests", () => {
  let app: INestApplication;
  let predictionsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    predictionsService = {
      create: jest.fn().mockResolvedValue({ id: 1 }),
      findByUser: jest.fn().mockResolvedValue([]),
      findByMatchFiltered: jest.fn().mockResolvedValue([]),
      findAllFiltered: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PredictionsController],
      providers: [
        { provide: PredictionsService, useValue: predictionsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { id: "user-1", role: "user" };
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      })
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("Input Validation - Predictions", () => {
    it("deve rejeitar score negativo", async () => {
      const res = await request(app.getHttpServer())
        .post("/predictions")
        .send({ matchId: 1, homeScore: -1, awayScore: 0 });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar score muito alto (>99)", async () => {
      const res = await request(app.getHttpServer())
        .post("/predictions")
        .send({ matchId: 1, homeScore: 100, awayScore: 0 });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar matchId como string", async () => {
      const res = await request(app.getHttpServer())
        .post("/predictions")
        .send({ matchId: "abc", homeScore: 1, awayScore: 0 });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar score decimal", async () => {
      const res = await request(app.getHttpServer())
        .post("/predictions")
        .send({ matchId: 1, homeScore: 1.5, awayScore: 0 });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar campos extras não permitidos", async () => {
      const res = await request(app.getHttpServer()).post("/predictions").send({
        matchId: 1,
        homeScore: 1,
        awayScore: 0,
        points: 10,
        user_id: "hacker",
      });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar matchId zero", async () => {
      const res = await request(app.getHttpServer())
        .post("/predictions")
        .send({ matchId: 0, homeScore: 1, awayScore: 0 });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar matchId negativo", async () => {
      const res = await request(app.getHttpServer())
        .post("/predictions")
        .send({ matchId: -1, homeScore: 1, awayScore: 0 });

      expect(res.status).toBe(400);
    });
  });

  describe("Parameter Validation - ParseIntPipe", () => {
    it("deve rejeitar matchId não numérico no path", async () => {
      const res = await request(app.getHttpServer()).get(
        "/predictions/match/abc"
      );

      expect(res.status).toBe(400);
    });

    it("deve rejeitar matchId com SQL injection no path", async () => {
      const res = await request(app.getHttpServer()).get(
        "/predictions/match/1;DROP TABLE predictions"
      );

      expect(res.status).toBe(400);
    });
  });

  describe("Authorization - Predictions Visibility", () => {
    it("findByMatchFiltered deve ser chamado com userId e role do usuário", async () => {
      await request(app.getHttpServer()).get("/predictions/match/1");

      expect(predictionsService.findByMatchFiltered).toHaveBeenCalledWith(
        1,
        "user-1",
        "user"
      );
    });
  });
});
