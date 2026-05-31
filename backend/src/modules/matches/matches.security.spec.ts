import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { MatchesController } from "./matches.controller";
import { MatchesService } from "./matches.service";
import { PredictionsService } from "../predictions/predictions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

describe("Matches Security Tests", () => {
  let app: INestApplication;
  let matchesService: Record<string, jest.Mock>;
  let predictionsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    matchesService = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue({ id: 1 }),
      findByStage: jest.fn().mockResolvedValue([]),
      findUpcoming: jest.fn().mockResolvedValue([]),
      updateResult: jest.fn().mockResolvedValue({ id: 1, played: true }),
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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
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

  describe("Parameter Validation", () => {
    it("deve rejeitar id não numérico", async () => {
      const res = await request(app.getHttpServer()).get("/matches/abc");
      expect(res.status).toBe(400);
    });

    it("deve rejeitar id com SQL injection", async () => {
      const res = await request(app.getHttpServer()).get(
        "/matches/1;DROP TABLE matches"
      );
      expect(res.status).toBe(400);
    });

    it("deve rejeitar stage inválido", async () => {
      const res = await request(app.getHttpServer()).get(
        "/matches/stage/INVALID_STAGE"
      );
      expect(res.status).toBe(400);
    });

    it("deve aceitar stage válido em lowercase", async () => {
      const res = await request(app.getHttpServer()).get(
        "/matches/stage/group"
      );
      expect(res.status).toBe(200);
    });

    it("deve aceitar stage válido em UPPERCASE", async () => {
      const res = await request(app.getHttpServer()).get(
        "/matches/stage/GROUP"
      );
      expect(res.status).toBe(200);
    });
  });

  describe("Update Result Validation", () => {
    it("deve rejeitar score negativo", async () => {
      const res = await request(app.getHttpServer())
        .patch("/matches/1/result")
        .send({ homeScore: -1, awayScore: 0 });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar score maior que 99", async () => {
      const res = await request(app.getHttpServer())
        .patch("/matches/1/result")
        .send({ homeScore: 100, awayScore: 0 });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar campos extras no body", async () => {
      const res = await request(app.getHttpServer())
        .patch("/matches/1/result")
        .send({ homeScore: 2, awayScore: 1, played: true, id: 999 });

      expect(res.status).toBe(400);
    });

    it("deve rejeitar body vazio", async () => {
      const res = await request(app.getHttpServer())
        .patch("/matches/1/result")
        .send({});

      expect(res.status).toBe(400);
    });

    it("deve rejeitar score decimal", async () => {
      const res = await request(app.getHttpServer())
        .patch("/matches/1/result")
        .send({ homeScore: 1.5, awayScore: 0 });

      expect(res.status).toBe(400);
    });
  });
});
